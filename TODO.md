# Project Reorganization and Deployment Plan

## Current Structure Analysis
- **Frontend**: React (Vite + TypeScript) - src/, index.html, package.json, vite.config.ts, etc.
- **Backend**: FastAPI (not Flask) - backend/ directory with API, models, CRUD, etc.
- **Database**: MySQL - setup_mysql.sql, backend/database.py, backend/models.py, backend/migrations/
- **Scripts/Utilities**: create_admin.py, setup_db.py, test_connect.py, drop_column.py, backend/run_migration.py, etc.

## Reorganization Steps
- [ ] Create new directories: frontend/, database/, scripts/
- [ ] Move frontend files to frontend/:
  - src/
  - index.html
  - package.json
  - package-lock.json
  - vite.config.ts
  - tailwind.config.js
  - postcss.config.js
  - tsconfig.app.json
  - tsconfig.json
  - tsconfig.node.json
  - eslint.config.js
- [ ] Move database files to database/:
  - setup_mysql.sql
  - backend/migrations/
  - backend/database.py
  - backend/models.py
- [ ] Move scripts to scripts/:
  - create_admin.py
  - setup_db.py
  - test_connect.py
  - drop_column.py
  - backend/run_migration.py
  - backend/sample_data.py
  - backend/check_admin.py
  - backend/create_admin.py
- [ ] Update file paths in moved files:
  - Update vite.config.ts for new src path
  - Update backend/main.py for migrations path
  - Update any imports in scripts
- [ ] Test the reorganized structure by running frontend and backend

## Deployment Suggestions
- Use Docker Compose with services:
  - frontend: Build React app, serve with nginx
  - backend: FastAPI with uvicorn
  - db: MySQL
- Separate repos for each if needed, but monorepo is fine for small projects
