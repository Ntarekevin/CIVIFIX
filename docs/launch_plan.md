# Launch & Pilot Configuration Checklist

## 1. Monitoring & Error Tracking

We strongly recommend **Sentry** for catching both API crashes and frontend blank screens.

**Backend Setup:**
```bash
npm install @sentry/node @sentry/profiling-node
```
In `server.js`, initialize it right after `dotenv.config()`:
```javascript
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.requestHandler()); // Before routes
app.use(Sentry.Handlers.errorHandler());   // After routes
```

**Frontend Setup:**
```bash
npm install @sentry/react @sentry/tracing
```
In `main.jsx`:
```javascript
import * as Sentry from '@sentry/react';
if (import.meta.env.PROD) {
  Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
}
```

## 2. Security Hardening Checklist Before Launch

- **SSL:** Ensure `https://` is active. Nginx should rewrite HTTP -> HTTPS.
- **Obfuscation Verification:** Open the Dashboard without logging in, and verify lat/lng endpoints are rounded to two decimal places (~1.1km).
- **Metadata Scrubbing:** Upload an image containing GPS EXIF tags, download it from S3/Uploads folder, and verify tags are completely gone using `exiftool`.
- **Database Rules:** Ensure `.env` connects using the limited `civifix_user` (restricted via RLS), not `postgres`.

## 3. Pilot Onboarding (Kigali, 500 Users)

**Targeting Strategy:**
- Partner with local neighborhood heads (Umudugudu) to encourage initial reports.
- Emphasize the **No App Needed** angle: Users just visit the URL on their mobile browser (Chrome/Safari).
- Focus messaging on three test categories: **Neighborhood Security**, **Local Infrastructure (Roads/Water)**, and **Public Service Feedback**.

**Feedback Loop:**
- Distribute an anonymous Google Form via SMS blast or community WhatsApp groups after week two.
- Ask: "Was the token tracking confusing?" and "Did the map fail to load?"

## 4. Launch "Flip the Switch" Process

1. Take the maintenance page down.
2. In Ubuntu terminal, tail the live logs:
   ```bash
   pm2 logs civifix-api
   ```
3. Watch database connection health via PM2 dashboards or custom grafana hooks.
4. Final announcement sent out by the NGO/Gov partner emphasizing that this is a **PILOT TEST (Beta)** and real responses may be delayed during the 30-day trial.
