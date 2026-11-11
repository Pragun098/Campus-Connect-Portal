# Campus Connect Portal

Campus Connect is a role-based university portal for students, faculty, and administrators. It provides dashboards for assignments, attendance, and campus notices, backed by an Express API and MongoDB.

## Features

- **Student portal:** View assignments, attendance summaries, and campus notices.
- **Faculty portal:** Post assignments and record attendance for students.
- **Administration portal:** Publish notices and create faculty or administrator accounts.
- **Authentication:** Register student accounts, sign in, and use server-managed HTTP-only session cookies.
- **MongoDB persistence:** Store users, sessions, assignments, attendance, notices, notes, and activities.
- **Notes and activities APIs:** Create, view, update, and delete notes and activities.

## Technology

- React, Vite, and React Router
- Node.js, Express, and Mongoose
- MongoDB (local or MongoDB Atlas)

## Requirements

- Node.js and npm
- MongoDB running locally, or a MongoDB Atlas cluster and database user

## Run locally

Open two terminals from the repository root.

### 1. Configure the backend

Create `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/student_demo_db
PORT=5000
```

For Atlas, replace the local URI with your Atlas driver connection string. Use a dedicated database user with appropriate access, allow your client IP in Atlas Network Access, and URL-encode special characters in the database user's password. Never commit `.env` or share its contents.

Optional: configure the first administrator account by adding all three variables below to `server/.env`:

```env
BOOTSTRAP_ADMIN_NAME=Campus Administrator
BOOTSTRAP_ADMIN_EMAIL=admin@example.edu
BOOTSTRAP_ADMIN_PASSWORD=replace-with-a-unique-password
```

Use a unique password. The backend creates this account only if the email does not already exist.

Install dependencies and start the API:

```powershell
cd server
npm ci
npm run dev
```

The API listens on `http://localhost:5000`. The root endpoint (`/`) returns a health response and a list of API route groups.

### 2. Configure and start the client

In another terminal:

```powershell
cd client
npm ci
npm run dev
```

Open the Vite URL shown in the terminal (by default, `http://localhost:5173`). In local development, Vite proxies `/api` requests to `http://localhost:5000`.

Students can register through the client. Faculty and administrator accounts must be created by an administrator. On an empty database, the backend also inserts demo accounts and sample dashboard data; demo seed credentials are defined in the server source and should not be relied on or retained in a production deployment.

## Deploy the client and API separately

The client and API must both be deployed and reachable over HTTPS for production use.

1. Deploy the Express server and configure its environment variables in the hosting provider:

   ```env
   MONGO_URI=<your-private-atlas-connection-string>
   PORT=<port-provided-by-host>
   CLIENT_ORIGIN=https://your-client-domain.example
   SESSION_COOKIE_SAME_SITE=None
   NODE_ENV=production
   ```

   `CLIENT_ORIGIN` must exactly match the deployed client origin (scheme and host, with no path). For multiple client origins, separate them with commas. `SameSite=None` requires HTTPS; the server sets the cookie's `Secure` attribute in production.

2. Set `VITE_API_URL` in the client build environment to the API's public origin, for example:

   ```env
   VITE_API_URL=https://your-api-domain.example
   ```

   This is a public API base URL, not a secret. Vite embeds it at build time, so rebuild and redeploy the client after changing it. Leave it empty when using the local Vite proxy.

3. Configure Atlas Network Access to allow the backend host's outbound IP addresses. Do not expose the database directly to the browser.

4. Confirm the API root responds, then test registration/sign-in and authenticated dashboard requests from the deployed client.

## API overview

All API routes are served by the backend. Protected endpoints require a valid session cookie.

| Route | Methods | Access |
|---|---|---|
| `/api/auth/register` | `POST` | Public; student accounts only |
| `/api/auth/login` | `POST` | Public |
| `/api/auth/me` | `GET` | Signed-in user |
| `/api/auth/logout` | `POST` | Signed-in user |
| `/api/auth/users` | `POST` | Administrator |
| `/api/dashboard/assignments` | `GET`, `POST` | Signed-in user; faculty or administrator may post |
| `/api/dashboard/attendance` | `GET`, `POST` | Signed-in user; faculty or administrator may record |
| `/api/dashboard/students` | `GET` | Faculty or administrator |
| `/api/dashboard/notices` | `GET`, `POST` | Signed-in user; administrator may publish |
| `/api/notes` | `GET`, `POST` | Notes CRUD API |
| `/api/notes/:id` | `GET`, `PUT`, `DELETE` | Notes CRUD API |
| `/api/activities` | `GET`, `POST` | Activities CRUD API |
| `/api/activities/:id` | `GET`, `PUT`, `PATCH`, `DELETE` | Activities CRUD API |

## Useful commands

Run these from their respective `client` or `server` directories:

```powershell
# Client
npm run lint
npm run build

# Server
npm test
npm start
```

## Repository layout

```text
client/   React and Vite frontend
server/   Express API, Mongoose models, and tests
```

## Security notes

- Keep database credentials and bootstrap administrator credentials in environment variables, never in source control.
- Restrict Atlas Network Access and database-user privileges to what the backend needs.
- Replace or disable demo seed accounts before deploying publicly.
- Use HTTPS for deployed client and API so secure session cookies can be sent by the browser.
