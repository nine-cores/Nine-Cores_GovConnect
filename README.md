# Docker Compose Setup

## Getting Started

Start the application stack:

```bash
docker compose up
```

## Access URLs

- **Client URL**: http://localhost:4600
- **Mail URL**: http://localhost:4608

## DB setup

```bash
PGPASSWORD="your_password" psql -h localhost -p 4605 -U your_username -d your_database -f dump-govconnect.sql
```

**Alternative options:**
- Use pgAdmin

**For non-Docker server setup:**
```bash
pnpm typeorm:generate
pnpm db:fresh
```


## GramaNiladhari Login

- username: rajesh.gn@gov.lk
- password: GN123!@#

