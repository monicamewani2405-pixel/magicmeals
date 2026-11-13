# MagicMeals: Accounts, Login Protection, Profile Page and Caching (Plan)

Status at start: the Sign In modal in `index.html` is a fake (`alert('Signed in successfully!')`). Nothing is stored or protected yet.
Already done by the owner: Upstash Redis created and connected on Vercel (free tier).

## Architecture

Browser -> Vercel functions in `/api/auth/*` -> (Redis: rate limits + cache) -> Shopify Storefront API (customer store)

- Shopify holds all customers (name, email, addresses, orders). We store no passwords.
- Login token lives only in an **HttpOnly + Secure + SameSite=Lax cookie**. Page JavaScript never sees it.
- Tokens and secrets are server-side env vars only.

## Environment variables (Vercel, never in code or chat)

| Name | Purpose |
|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_*`) | Redis, added automatically |
| `SHOPIFY_STORE_DOMAIN` | `1z10zd-y0.myshopify.com` |
| `SHOPIFY_STOREFRONT_TOKEN` | the existing Storefront token (move out of `shopify-config.js` for server use) |
| `GOOGLE_CLIENT_ID` | Google sign-in (public value) |
| `GOOGLE_LOGIN_SECRET` | long random string; derives the hidden credential for Google users |
| `SESSION_SECRET` | long random string for cookie signing |

## Phase 0: Checks (owner)
1. Shopify admin > Settings > Customer accounts: confirm **classic** accounts (Storefront `customerCreate` and `customerAccessTokenCreate` need them).
2. Google Cloud Console > Credentials > OAuth client ID (Web). Authorized origins: `https://magicmeals.shop`, `https://magicmeals-one.vercel.app`. Send the Client ID.
3. Generate `GOOGLE_LOGIN_SECRET` and `SESSION_SECRET` (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) and add them in Vercel.

## Phase 1: Endpoints (`/api/auth/`)
- `signup.js`: validate, rate-limit, `customerCreate`, then log in, set cookie.
- `login.js`: validate, rate-limit, `customerAccessTokenCreate`, set cookie.
- `google.js`: verify Google ID token (signature, `aud` = our Client ID, `email_verified`), find or create the Shopify customer with a derived credential `HMAC(GOOGLE_LOGIN_SECRET, google_sub)`, set cookie.
- `logout.js`: clear the cookie (and `customerAccessTokenDelete`).
- `me.js`: return name, email, addresses and recent orders for the cookie's token.
- `recover.js`: `customerRecover` (Shopify emails the reset link). Rate-limited.
- Shared helper `api/_lib/ratelimit.js`, `shopify.js`, `session.js`.

## Phase 2: Rate limiting (Redis)
Fixed, simple rules; return HTTP 429 plus `Retry-After` and a friendly message ("Too many attempts. Try again in 12 minutes.").

| Action | Key | Limit | Lockout |
|---|---|---|---|
| Login fail | email (lowercased, hashed) | 5 / 15 min | 15 min, doubling on repeats (max 1 h) |
| Login | IP | 20 / hour | 1 h |
| Signup | IP | 3 / hour | 1 h |
| Password recovery | email and IP | 3 / hour | 1 h |
| Google login | IP | 60 / hour (loose; no per-email lockout, Google already verifies the user) | 15 min |

Owner decision: the strict "5 tries then wait" rule applies **only to password login**. Google sign-in is not subject to it.

- A successful login clears that email's fail counter.
- Always give the same message for "wrong email" and "wrong password" (no account enumeration).
- Honeypot hidden field and basic input validation (email format, password length 8 to 64).
- Optional hardening: Cloudflare Turnstile after 3 fails, plus a Vercel Firewall rate-limit rule as a second layer.

## Phase 3: Frontend
- Rebuild the auth modal in `index.html` / `main.js`: Sign In, Sign Up, "Continue with Google", "Forgot password", loading and error states, and a countdown when locked out.
- Header: Sign In icon when logged out; Profile when logged in.
- Profile page/panel: details, saved addresses, order history, logout.
- Checkout: pass the logged-in customer's email into the Shopify checkout so orders link to the account.

## Phase 4: Caching (Redis and CDN)
- Profile and orders: cache the `me` response in Redis for 60 seconds per customer, and clear it on logout and profile change.
- Pincode checker: `api/pincode.js` already caches in memory; move to Redis so the cache is shared across instances (6 h per PIN).
- Product and catalog data: static files get `Cache-Control: public, max-age=31536000, immutable` (hashed or versioned URLs); HTML gets short or revalidating cache. Set in `vercel.json`.
- Never cache any `/api/auth/*` response in the CDN (`Cache-Control: no-store`).

## Phase 5: Security hardening
- Cookies: HttpOnly, Secure, SameSite=Lax; short life (e.g. 7 days).
- CORS: same-origin only. Security headers in `vercel.json` (CSP including Google, `X-Frame-Options`, `Referrer-Policy`).
- Logs never contain passwords or tokens.
- Add the Shopify domain to Razorpay (done) and keep the Vercel domains in the Google origins list.

## Phase 6: Testing
- Script: 6 wrong logins on one email must give 429 on the 6th and a success after the lockout.
- 4 signups from one IP must block the 4th.
- Cookie flags checked in the browser dev tools; the token is not readable from the console.
- Google login: new user, returning user, and unverified-email rejection.
- Forgot-password email arrives; lockout message shows a correct countdown.

## Order of work (if time is short)
1. Phase 1 `login` and `signup` plus Phase 2 limits (this is the client promise).
2. Phase 3 modal wiring.
3. Google login.
4. Profile page.
5. Caching and header hardening.

## What to tell the client
"Accounts are backed by Shopify's customer database. Login and signup are rate-limited (5 failed tries per 15 minutes), and Google sign-in is supported." Say this only after Phase 2 is live and tested.

