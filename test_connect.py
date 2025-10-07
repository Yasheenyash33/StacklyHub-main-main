import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='training_user',
        password='training_password',
        database='training_app',
        cursorclass=pymysql.cursors.DictCursor
    )
    print("Connection successful")
    connection.close()
except Exception as e:
    print(f"Connection failed: {e}")
