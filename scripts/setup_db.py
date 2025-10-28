import pymysql

# Connect to MySQL server
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='DemoN@33#',
    cursorclass=pymysql.cursors.DictCursor
)

try:
    with connection.cursor() as cursor:
        # Read the SQL file
        with open('database/setup_mysql.sql', 'r') as file:
            sql_script = file.read()
        
        # Split the script into individual statements
        statements = sql_script.split(';')

        for statement in statements:
            statement = statement.strip()
            if statement:
                print(f"Executing: {statement}")
                cursor.execute(statement)

        # Drop the user if exists and recreate
        try:
            cursor.execute("DROP USER IF EXISTS 'training_user'@'localhost';")
            print("Dropped existing user")
        except Exception as e:
            print(f"Drop user failed: {e}")

        try:
            cursor.execute("CREATE USER 'training_user'@'localhost' IDENTIFIED WITH mysql_native_password BY '';")
            print("Created user with mysql_native_password")
        except Exception as e:
            print(f"Create user failed: {e}")

        try:
            cursor.execute("GRANT ALL PRIVILEGES ON training_app.* TO 'training_user'@'localhost';")
            print("Granted privileges")
        except Exception as e:
            print(f"Grant failed: {e}")

        try:
            cursor.execute("FLUSH PRIVILEGES;")
            print("Flushed privileges")
        except Exception as e:
            print(f"Flush failed: {e}")
        
        connection.commit()
        print("Database setup completed successfully.")
        
finally:
    connection.close()
