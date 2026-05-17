# BuildTrack Backend (Spring Boot + MySQL)

REST API for the BuildTrack frontend.

## Stack
- Java 17, Spring Boot 3.3
- Spring Web, Spring Data JPA, Spring Security
- MySQL 8 (auto-creates `new_house` database on first run)
- JWT auth (HS256)

## Configure MySQL
Edit `src/main/resources/application.properties` if your password isn't `root`,
or set env vars:

```
MYSQL_PASSWORD=yourpassword
JWT_SECRET=any-long-random-string-32-chars-or-more
```

Default DB: `new_house` @ `127.0.0.1:3306`, user `root`.
(The `createDatabaseIfNotExist=true` flag creates it automatically.)

## Run
```
cd backend
./mvnw spring-boot:run        # mac/linux
mvnw.cmd spring-boot:run      # windows
```

Or with installed Maven:
```
mvn spring-boot:run
```

API starts at `http://localhost:8080`.

## Default admin
Auto-created on first start: `admin` / `admin123`
(change `app.admin.password` in application.properties).

## Endpoints

| Method | Path                    | Description           |
|--------|-------------------------|-----------------------|
| POST   | `/api/auth/login`       | `{username,password}` → `{token,username}` |
| GET    | `/api/auth/me`          | Validate current token |
| GET    | `/api/expenses`         | List expenses |
| POST   | `/api/expenses`         | Create expense |
| PUT    | `/api/expenses/{id}`    | Update expense |
| DELETE | `/api/expenses/{id}`    | Delete expense |
| GET    | `/api/workers`          | List workers |
| POST   | `/api/workers`          | Create worker |
| PUT    | `/api/workers/{id}`     | Update worker |
| DELETE | `/api/workers/{id}`     | Delete worker |
| GET    | `/api/budgets`          | List budget items |
| PUT    | `/api/budgets`          | Upsert array of budget items |
| DELETE | `/api/budgets/{cat}`    | Delete a budget item |
| GET    | `/api/categories`       | List category names |
| PUT    | `/api/categories`       | Replace list |
| GET    | `/api/work-stages`      | List work stages |
| PUT    | `/api/work-stages`      | Replace list |
| GET    | `/api/settings`         | Get app settings |
| PUT    | `/api/settings`         | Update app settings |

All `/api/**` routes except `/api/auth/**` require an `Authorization: Bearer <token>` header.

## Frontend connection
Set in the frontend project root (`.env` or `.env.local`):
```
VITE_API_BASE_URL=http://localhost:8080/api
```