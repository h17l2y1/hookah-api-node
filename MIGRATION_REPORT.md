# Migration Report

## What Was Migrated

- Migrated the .NET backend contract into a new NestJS + Fastify + Prisma app under `nestjs-api`.
- Recreated all controllers from the legacy API:
  - `Account`
  - `Brand`
  - `Country`
  - `Heaviness`
  - `Image`
  - `Line`
  - `Mix`
  - `Review`
  - `Tag`
  - `Tobacco`
- Preserved the legacy route pattern `api/[Controller]/[Action]`.
- Added JWT auth, role guards, global validation, a unified error filter, CORS, and Swagger/OpenAPI.
- Modeled the database in Prisma for PostgreSQL on Neon.
- Ported the main business flows:
  - sign up
  - login
  - refresh auth token
  - CRUD for brands, countries, images, lines, tags, tobaccos
  - mix creation and listing
  - review creation and rating recalculation
  - admin-only tag mutation and admin check
- Added Docker support for API runtime with external Neon PostgreSQL.

## Available Endpoints

The migrated endpoints are the same set identified in `MIGRATION_PLAN.md`:

- `POST /api/Account/SignUp`
- `POST /api/Account/Login`
- `POST /api/Account/RefreshAuthToken`
- `GET /api/Account/IsAdmin`
- `GET /api/Brand/GetById/:id`
- `GET /api/Brand/GetAll`
- `GET /api/Brand/GetOptions`
- `POST /api/Brand/Create`
- `PUT /api/Brand/Update`
- `DELETE /api/Brand/Remove/:id`
- `GET /api/Country/GetById/:id`
- `GET /api/Country/GetOptions`
- `POST /api/Country/Create`
- `PUT /api/Country/Update`
- `DELETE /api/Country/Remove/:id`
- `GET /api/Heaviness/GetOptions`
- `GET /api/Image/GetById/:id`
- `POST /api/Image/Create`
- `PUT /api/Image/Update`
- `DELETE /api/Image/Remove/:id`
- `GET /api/Line/GetById/:id`
- `POST /api/Line/Create`
- `PUT /api/Line/Update`
- `DELETE /api/Line/Remove/:id`
- `GET /api/Line/GetLinesByBrandId/:id`
- `GET /api/Mix/GetById/:id`
- `POST /api/Mix/Create`
- `GET /api/Mix/GetAll`
- `POST /api/Review/Create`
- `GET /api/Tag/GetById/:id`
- `GET /api/Tag/GetAll`
- `POST /api/Tag/Create`
- `PUT /api/Tag/Update`
- `DELETE /api/Tag/Remove/:id`
- `GET /api/Tag/GetOptions`
- `GET /api/Tag/GetGlobalOptions`
- `GET /api/Tobacco/GetById/:id`
- `GET /api/Tobacco/GetAll`
- `POST /api/Tobacco/Create`
- `PUT /api/Tobacco/Update`
- `DELETE /api/Tobacco/Remove/:id`
- `GET /api/Tobacco/GetByBrandId/:id`

## Installed Npm Packages

Runtime dependencies:

- `@nestjs/common`
- `@nestjs/config`
- `@nestjs/core`
- `@nestjs/jwt`
- `@nestjs/passport`
- `@nestjs/platform-fastify`
- `@nestjs/swagger`
- `@fastify/swagger`
- `@fastify/swagger-ui`
- `@prisma/client`
- `bcrypt`
- `class-transformer`
- `class-validator`
- `passport`
- `passport-jwt`
- `reflect-metadata`
- `rxjs`

Dev dependencies:

- `prisma`
- `tsx`
- `typescript`
- `@types/node`
- `@types/bcrypt`
- `@types/passport-jwt`

## How To Run

```bash
cd nestjs-api
npm install
npx prisma generate
npm run start:dev
```

For production build:

```bash
cd nestjs-api
npm run build
npm run start:prod
```

## Environment Setup

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `IMGUR_CLIENT_ID`
- `IMGUR_CLIENT_SECRET`
- `IMGUR_ACCESS_TOKEN`
- `PORT`

Example:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET="replace-me"
JWT_ACCESS_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="48h"
IMGUR_CLIENT_ID=""
IMGUR_CLIENT_SECRET=""
IMGUR_ACCESS_TOKEN=""
PORT=3000
```

## Database Commands

If you have access to Neon PostgreSQL:

```bash
cd nestjs-api
npx prisma generate
npx prisma migrate dev --name init
```

Point `DATABASE_URL` at your Neon connection string.

## Verification

- `npm run build` passed.
- `npx prisma generate` passed.
- `npm run start:prod` started successfully after removing eager Prisma connect on bootstrap.
- `GET /swagger` returned HTTP 200.
- `GET /swagger-json` returned a valid OpenAPI document.

## Manual Checks Still Needed

- A real Neon/PostgreSQL instance was not available in this environment, so `npx prisma migrate dev` could not be completed here.
- Prisma relation shape for legacy Identity-style user data should be validated against the target PostgreSQL schema before production use.
- Legacy SQLite seed data was not fully ported line-for-line; initial data should be reviewed and expanded if the UI depends on it.
- External Imgur credentials and upload behavior should be tested against the real environment.
- Refresh token policy should be checked against the exact security requirements for production.

## Differences From The .NET Version

- The API is now NestJS + Fastify instead of ASP.NET Core.
- The database layer is Prisma instead of EF Core.
- Passwords are hashed for login storage in the new service; the schema still keeps a `Password` field to stay close to the legacy shape.
- Startup no longer eagerly connects to the database, so the app can boot and serve Swagger even when Neon is unavailable in the local environment.
- The Prisma schema normalizes some of the legacy join-table inconsistencies from the SQLite database file and uses PostgreSQL types.
