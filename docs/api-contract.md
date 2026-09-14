# StudySwap API Contract

Reference for all client–server endpoints. Base URL: `<host>/api`.

- **Auth:** `Authorization: Bearer <token>` header. Token = JWT from signup/login (7-day TTL).
- **Success shape:** `{ "data": ... }`
- **Error shape:** `{ "error": { "message": "...", "status": N } }` — always JSON.

---

## Users

### POST /users/signup — create account
Auth: none

Request:
```json
{ "name": "Jane", "email": "jane@cqu.edu.au", "password": "min8chars", "campus": "MEL" }
```
`campus` optional: `BNE | SYD | MEL | DST | other` (default `other`).

Response `201`:
```json
{ "data": { "token": "<jwt>", "user": { "id": "...", "name": "Jane", "email": "jane@cqu.edu.au", "campus": "MEL", "createdAt": "..." } } }
```

Errors: `400` missing fields / password < 8 chars / invalid email · `409` email exists

### POST /users/login
Auth: none

Request: `{ "email": "...", "password": "..." }`

Response `200`: same shape as signup `data`.

Errors: `400` missing fields · `401` `Invalid email or password` (same message for unknown email and wrong password — no enumeration)

### POST /users/logout
Auth: **required**

Response `200`: `{ "data": { "message": "Logged out", "userId": "..." } }`

Errors: `401` (no/expired token)

### GET /users/me
Auth: **required**

Response `200`: `{ "data": { "user": { ...public user... } } }`

Errors: `401` · `404` user deleted since token issued

---

## Listings

Listing object:
```json
{
  "_id": "...",
  "title": "Calculus textbook 9th ed",
  "description": "Barely used",
  "price": 45,
  "category": "textbooks",
  "photo": "",
  "status": "active",
  "seller": "<id on create; {name, campus} when populated>",
  "createdAt": "..."
}
```
`category`: `textbooks | furniture | electronics | other` · `status`: `active | sold`

### GET /listings — browse
Auth: none (public). Excludes `sold` by default.

Query params:
- `category` — one of the enum values
- `status` — `active` (default) or `sold`
- `q` — case-insensitive search in title/description
- `limit` — max results (default 50, max 100)
- `skip` — offset for paging

Response `200`: `{ "data": { "listings": [ ... ] } }` — each with `seller` populated as `{ name, campus }` (never the password hash).

### GET /listings/:id — detail
Auth: none (public)

Response `200`: `{ "data": { "listing": ... } }` with seller populated.

Errors: `400` malformed id · `404` not found

### POST /listings — create
Auth: **required**

Request: `{ "title": "...", "description": "...", "price": 45, "category": "textbooks", "photo": "<optional>" }`

Response `201`: `{ "data": { "listing": ... } }` (seller is the raw id here)

Errors: `400` missing title/price/category, bad category, negative price · `401`

### PUT /listings/:id — update
Auth: **required, owner only**

Request: any subset of `{ title, description, price, category, photo, status }` (e.g. `status: "sold"` to mark sold)

Response `200`: `{ "data": { "listing": ... } }`

Errors: `400` validation/malformed id · `401` · `403` not the owner · `404`

### DELETE /listings/:id
Auth: **required, owner only**

Response `200`: `{ "data": { "message": "Listing deleted" } }`

Errors: `400` malformed id · `401` · `403` not the owner · `404` (incl. already deleted)

---

## HTTP verb coverage (spec requirement)

| Verb | Endpoints |
|---|---|
| GET | /users/me, /listings, /listings/:id |
| POST | /users/signup, /users/login, /users/logout, /listings |
| PUT | /listings/:id |
| DELETE | /listings/:id |
