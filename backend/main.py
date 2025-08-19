from fastapi import FastAPI, Depends, HTTPException, status, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from datetime import datetime, timedelta, date
from decimal import Decimal
from uuid import UUID
import os
import psycopg
import jwt  # PyJWT

# ---- App ----
app = FastAPI(title="PredictPiX API")

# ---- CORS (driven by FRONTEND_ORIGIN) ----
origins_env = os.getenv("FRONTEND_ORIGIN", "*").strip()
allowed_origins = ["*"] if not origins_env or origins_env == "*" else [o.strip() for o in origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- ENV & JWT config ----
def _env(name: str, default: Optional[str] = None) -> Optional[str]:
    v = os.getenv(name)
    return v if v is not None and str(v).strip() != "" else default

JWT_SECRET = _env("JWT_SECRET", None)  # must be set for JWT to work
JWT_ISSUER = _env("JWT_ISSUER", "predictpix")
JWT_AUDIENCE = _env("JWT_AUDIENCE", "predictpix-clients")
JWT_ALG = _env("JWT_ALG", "HS256")
JWT_EXPIRES_MIN = int(_env("JWT_EXPIRES_MIN", "15"))

# API keys (single or CSV) — still used for /api/auth/login only
def _load_api_keys() -> set[str]:
    keys = set()
    k1 = _env("API_KEY")
    if k1:
        keys.add(k1.strip())
    csv = _env("API_KEYS_CSV")
    if csv:
        for k in csv.split(","):
            k = k.strip()
            if k:
                keys.add(k)
    return keys

API_KEYS = _load_api_keys()

# ---- DB helper ----
DB_URL = _env("DATABASE_URL")
def _connect():
    if not DB_URL:
        raise RuntimeError("DATABASE_URL missing in env")
    return psycopg.connect(DB_URL, connect_timeout=5)

# ---- JSON helpers ----
def _jsonify_rows(cur) -> List[dict]:
    """Return list[dict] from cursor with safe JSON types."""
    cols = [c[0] for c in cur.description]
    out: List[dict] = []
    for row in cur.fetchall():
        obj = {}
        for k, v in zip(cols, row):
            if isinstance(v, Decimal):
                obj[k] = float(v)
            elif isinstance(v, (datetime, date)):
                obj[k] = v.isoformat()
            else:
                obj[k] = v
        out.append(obj)
    return out

# ---- Auth helpers ----
class _AuthOK:  # tiny marker
    def __init__(self, mode: str, subject: str):
        self.mode = mode
        self.subject = subject

def _make_access_token(subject: str) -> str:
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT not configured")
    now = datetime.utcnow()
    payload = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXPIRES_MIN)).timestamp()),
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def _verify_jwt(token: str) -> dict:
    if not JWT_SECRET:
        raise HTTPException(status_code=401, detail="invalid or missing auth")
    try:
        return jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALG],
            audience=JWT_AUDIENCE,
            issuer=JWT_ISSUER,
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="invalid token")

def require_auth(
    x_api_key: Optional[str] = Header(default=None, convert_underscores=False, alias="X-API-Key"),
    authorization: Optional[str] = Header(default=None),
) -> _AuthOK:
    # Mixed mode: API key OR Bearer JWT
    if x_api_key:
        if x_api_key in API_KEYS:
            return _AuthOK(mode="api_key", subject="api-key")
        raise HTTPException(status_code=401, detail="invalid or missing auth")
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        claims = _verify_jwt(token)
        return _AuthOK(mode="jwt", subject=str(claims.get("sub", "jwt")))
    raise HTTPException(status_code=401, detail="invalid or missing auth")
# ---- Auth endpoints ----
from pydantic import BaseModel

class LoginBody(BaseModel):
    api_key: Optional[str] = None  # allow body or header

@app.post("/api/auth/login")
def auth_login(body: LoginBody = None, x_api_key: Optional[str] = Header(default=None, convert_underscores=False, alias="X-API-Key")):
    # Phase B: API keys are used only here to mint a JWT (no direct access with keys)
    key = (body.api_key if body else None) or (x_api_key or "").strip()
    if not key or key not in API_KEYS:
        raise HTTPException(status_code=401, detail="invalid or missing API key")
    token = _make_access_token("api-key")
    return {"access_token": token, "token_type": "bearer", "expires_in": JWT_EXPIRES_MIN * 60}

@app.post("/api/auth/refresh")
def auth_refresh(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="invalid or missing auth")
    old = authorization.split(" ", 1)[1].strip()
    claims = _verify_jwt(old)
    subject = str(claims.get("sub", "api-key"))
    token = _make_access_token(subject)
    return {"access_token": token, "token_type": "bearer", "expires_in": JWT_EXPIRES_MIN * 60}

# ---- Health ----
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/api/health")
def api_health():
    return {"ok": True}

# ---- DB ready ----
@app.get("/db/ready")
def db_ready():
    url = DB_URL
    if not url:
        return {"db": "err", "error": "DATABASE_URL missing"}
    try:
        with _connect() as conn:
            with conn.cursor() as cur:
                cur.execute("select 1")
                cur.fetchone()
        return {"db": "ok"}
    except Exception as e:
        return {"db": "err", "error": str(e)[:200]}

# ---- Markets & Positions (minimal, matching prior shape) ----
@app.get("/api/markets")
def list_markets(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort: str = Query("created_at"),
    direction: str = Query("desc")
):
    valid_sort = {"created_at", "end_date"}
    if sort not in valid_sort:
        sort = "created_at"
    direction = "desc" if direction.lower() != "asc" else "asc"
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            f"""
            select id, question, category, tier, status,
                   created_at, end_date, liquidity, resolved, outcome
            from public.markets
            order by {sort} {direction}
            limit %s offset %s
            """,
            (limit, offset),
        )
        items = _jsonify_rows(cur)
        # total (cheap estimate with count)
        cur.execute("select count(*) from public.markets")
        total = cur.fetchone()[0]
    return {"items": items, "page": {"limit": limit, "offset": offset, "total": int(total)}}

class PredictBody(BaseModel):
    user_id: UUID
    side: str   # "yes" / "no"
    amount: Decimal

@app.post("/api/markets/{market_id}/predict")
def place_prediction(market_id: UUID, body: PredictBody, _auth: _AuthOK = Depends(require_auth)):
    if str(body.side).lower() not in {"yes", "no"}:
        raise HTTPException(status_code=400, detail="side must be 'yes' or 'no'")
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            """
            insert into public.positions (user_id, market_id, side, amount)
            values (%s, %s, %s, %s)
            returning id, user_id, market_id, side, amount, created_at
            """,
            (str(body.user_id), str(market_id), str(body.side).lower(), body.amount),
        )
        row = _jsonify_rows(cur)
        conn.commit()
    return row[0]

@app.get("/api/positions")
def list_positions(
    user_id: UUID,
    market_id: Optional[UUID] = None,
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    _auth: _AuthOK = Depends(require_auth),
):
    sql = """
        select id, user_id, market_id, side, amount, created_at
        from public.positions
        where user_id=%s
    """
    params = [str(user_id)]
    if market_id:
        sql += " and market_id=%s"
        params.append(str(market_id))
    sql += " order by created_at desc limit %s offset %s"
    params.extend([limit, offset])
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(sql, tuple(params))
        items = _jsonify_rows(cur)
    return {"items": items, "page": {"limit": limit, "offset": offset, "total": len(items)}}
