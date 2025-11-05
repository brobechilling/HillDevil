<!-- Copilot / AI agent instructions for the HillDevil repository -->
# Quick orientation for AI coding agents

This repository is a two-part monorepo: a Spring Boot backend (Java 21, Maven) in `backend/` and a Vite + React TypeScript frontend in `frontend/`. The production image is built with a multi-stage Dockerfile at the repo root and there is a `docker-compose.yml` to run the backend service locally.

Keep instructions short and concrete. Prefer making small, reversible edits and reference these files when in doubt:

- Backend entry and build: `backend/pom.xml`, `backend/mvnw` / `backend/mvnw.cmd`.
- Backend runtime config: `backend/src/main/resources/application.yml`.
- Liquibase changelogs: `backend/src/main/resources/db/changelog/db.changelog-master.yaml` (used by the liquibase maven plugin in `pom.xml`).
- Frontend entry and scripts: `frontend/package.json`, `frontend/vite.config.ts`.
- Frontend API wrappers: `frontend/src/api/axiosClient.ts` (centralized HTTP client/auth handling).
- Frontend store/layout patterns: `frontend/src/store/*` and `frontend/src/components/*` (components grouped by role: admin/owner/manager/etc.).
- Docker / compose: `Dockerfile` (multi-stage: builds frontend then backend), `docker-compose.yml` (service name in compose: `spring-app`).

Useful commands (Windows PowerShell):

- Run backend locally (development):
  - cd into repo root and run: `./backend/mvnw.cmd spring-boot:run` (uses `backend/src/main/resources/application.yml`).
- Build backend jar (skip tests for quick iteration):
  - `./backend/mvnw.cmd clean package -DskipTests`
- Run frontend dev server (hot reload):
  - `cd frontend` then `npm install` and `npm run dev` (default host 0.0.0.0, port 5000).
- Run both using Docker Compose:
  - Create a `.env` with required env vars (see `application.yml` keys) then `docker-compose up --build`.

Key environment variables used by the app (reference `application.yml` and `docker-compose.yml`):
- DB_URL, DB_USERNAME, DB_PASSWORD (Postgres JDBC URL and credentials)
- JWT_SIGNER_KEY, JWT_ISSUER
- PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY (external payment)
- FRONTEND_BASE_URL
- CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET (Cloudinary)

Project-specific patterns and conventions
- Single artifact: frontend build is copied into `src/main/resources/static` during the Docker build (see `Dockerfile`). For production, the backend serves the frontend static files.
- MapStruct is used for mapping (see `pom.xml` - annotation processing). When editing DTOs / mappers, ensure annotation processors complete (Java 21 is targeted).
- Liquibase is configured via the Maven plugin in `pom.xml`. Changelogs live under `backend/src/main/resources/db/changelog`. The plugin reads DB credentials from environment variables.
- API surface: frontend `src/api/*.ts` contains typed clients; reuse these when adding new endpoints. Backend controllers live under `backend/src/main/java` in packages under `com.example` — follow existing service/controller naming (`*Service`, `*Controller`).
- Auth: token handling is centralized in the frontend `axiosClient.ts` and backend `jwt.*` config in `application.yml`.

Where to look for examples when implementing features
- Adding a new REST endpoint: follow patterns in existing controllers and services (e.g., `backend/src/main/java/com/example/.../service/*Service.java` and corresponding controllers). Use MapStruct mappers for DTOs.
- Adding a new frontend route/view: add the route in `frontend/src/routes.tsx`, create components under a role folder when appropriate, and call the API client in `frontend/src/api/*`.

Testing and linting
- Backend: use `./backend/mvnw.cmd test` for unit tests.
- Frontend: `npm run lint` from `frontend/` (ESLint + project rules).

Small, safe edits guidance
- Prefer small PRs that modify a single layer (frontend or backend). When changing DTOs, update mappers and API clients together.
- When adding env vars, update `application.yml` references and mention them in the repo `.env.example` (if you add one).

If something is unclear, open the following for context before coding: `backend/pom.xml`, `backend/src/main/resources/application.yml`, `frontend/package.json`, `frontend/src/api/axiosClient.ts`, and the `Dockerfile`.

Please ask for clarifications if you need runtime secrets or confirmation to run database migrations in CI. When in doubt, prefer edits that are reversible and include a short test or verification step in the PR description.
