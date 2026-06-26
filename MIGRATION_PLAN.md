# Migration Plan

## 1. .NET Controllers Found

- `AccountController`
- `BrandController`
- `CountryController`
- `HeavinessController`
- `ImageController`
- `LineController`
- `MixController`
- `ReviewController`
- `TagController`
- `TobaccoController`

## 2. Endpoints Found

- `POST /api/Account/SignUp`
- `POST /api/Account/Login`
- `POST /api/Account/RefreshAuthToken`
- `GET /api/Account/IsAdmin`

- `GET /api/Brand/GetById/{id}`
- `GET /api/Brand/GetAll`
- `GET /api/Brand/GetOptions`
- `POST /api/Brand/Create`
- `PUT /api/Brand/Update`
- `DELETE /api/Brand/Remove/{id}`

- `GET /api/Country/GetById/{id}`
- `GET /api/Country/GetOptions`
- `POST /api/Country/Create`
- `PUT /api/Country/Update`
- `DELETE /api/Country/Remove/{id}`

- `GET /api/Heaviness/GetOptions`

- `GET /api/Image/GetById/{id}`
- `POST /api/Image/Create`
- `PUT /api/Image/Update`
- `DELETE /api/Image/Remove/{id}`

- `GET /api/Line/GetById/{id}`
- `POST /api/Line/Create`
- `PUT /api/Line/Update`
- `DELETE /api/Line/Remove/{id}`
- `GET /api/Line/GetLinesByBrandId/{id}`

- `GET /api/Mix/GetById/{id}`
- `POST /api/Mix/Create`
- `GET /api/Mix/GetAll`

- `POST /api/Review/Create`

- `GET /api/Tag/GetById/{id}`
- `GET /api/Tag/GetAll`
- `POST /api/Tag/Create`
- `PUT /api/Tag/Update`
- `DELETE /api/Tag/Remove/{id}`
- `GET /api/Tag/GetOptions`
- `GET /api/Tag/GetGlobalOptions`

- `GET /api/Tobacco/GetById/{id}`
- `GET /api/Tobacco/GetAll`
- `POST /api/Tobacco/Create`
- `PUT /api/Tobacco/Update`
- `DELETE /api/Tobacco/Remove/{id}`
- `GET /api/Tobacco/GetByBrandId/{id}`

## 3. Entities Found

- `Brand`
- `Country`
- `Image`
- `Line`
- `Tobacco`
- `Heaviness`
- `Tag`
- `TobaccoTag`
- `TobaccoMix`
- `Mix`
- `User`
- `Review`
- `RefreshToken`
- `BlackListRefreshToken`
- `BaseEntity`
- `Filter` model
- `ImageType` enum

## 4. Prisma Tables Planned

- `brands`
- `countries`
- `images`
- `lines`
- `tobaccos`
- `heaviness`
- `tags`
- `tobacco_tags`
- `tobacco_mixes`
- `mixes`
- `users`
- `reviews`
- `refresh_tokens`
- `black_list_refresh_tokens`

## Database Target

- Primary database: Neon PostgreSQL
- Prisma datasource: `postgresql`
- Connection via standard `DATABASE_URL`

## 5. NestJS Modules Planned

- `auth`
- `brands`
- `countries`
- `heaviness`
- `images`
- `lines`
- `mixes`
- `reviews`
- `tags`
- `tobaccos`
- shared infrastructure under `src/common`, `src/config`, `src/database`

## 6. Ambiguous or Risky Areas

- Current source uses SQLite, but the target stack must use PostgreSQL on Neon.
- `User` is an ASP.NET Identity-style entity, but the current schema is not a clean one-to-one mapping.
- Existing SQLite schema contains surprising columns such as `Reviews.UserId1`, `TobaccoTags.TobaccoId1`, and string/int inconsistencies in join entities.
- JWT refresh flow validates refresh tokens as JWTs, but the token storage also persists them in the database.
- `Imgur` integration depends on external API behavior and should be verified after migration.
- Some controllers use `[action]` routing and therefore expose routes that are not REST-style.

## 7. Parts That Can Be Migrated Automatically

- Controller action inventory and route names
- DTO field inventory and basic validation rules
- Entity field inventory
- Simple CRUD service behavior
- Pagination/filter pattern from `GetAllRequest`
- Swagger/OpenAPI metadata scaffolding

## 8. Parts Requiring Manual Verification

- Prisma relation design for user/review/refresh-token tables
- Join-table modeling for `TobaccoTag` and `TobaccoMix`
- Password hashing and sign-up/login semantics
- JWT refresh token format and expiration logic
- Exact PostgreSQL column types for `double`, `decimal`, and identifier fields
- Whether any fields currently stored as strings should become numeric IDs in the new schema
- Whether image upload handling should remain fully compatible with the current Imgur flow
