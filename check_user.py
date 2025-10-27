import pymysql

# Connect to MySQL server as root
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='DemoN@33#',
    cursorclass=pymysql.cursors.DictCursor
)

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT user, host, authentication_string FROM mysql.user WHERE user = 'training_user';")
        result = cursor.fetchone()
        print("User info:", result)
        
        # Check if user exists
        if result:
            print("User exists")
        else:
            print("User does not exist")
        
finally:
    connection.close()
