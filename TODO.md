# TODO: Remove Password for Database User

- [x] Modify database/database.py: Change default DB_PASSWORD to '', remove the raise if not set.
- [x] Modify database/setup_mysql.sql: Change password to ''.
- [x] Modify scripts/setup_db.py: Change password to ''.
- [x] Modify scripts/test_connect.py: Remove password parameter.
- [x] Run python scripts/setup_db.py to update the user in MySQL.
- [x] Test connection with python scripts/test_connect.py.
