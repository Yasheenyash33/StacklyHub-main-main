# Training Management System

## 📘 Project Overview

A comprehensive web application for managing training sessions, users, and analytics in an educational or corporate training environment. Built with modern web technologies for scalability and real-time collaboration.

### Description
The Training Management System is designed to streamline the process of organizing and tracking training programs. It provides a centralized platform where administrators can manage users, trainers can schedule sessions, and trainees can participate in training activities. The system supports real-time updates to ensure all users have the latest information.

### Key Features and Functionality
- **User Management**: Role-based access control with Admin, Trainer, and Trainee roles
- **Session Management**: Create, schedule, update, and track training sessions with status monitoring
- **Analytics Dashboard**: View user distribution by roles and session statistics
- **Real-Time Updates**: WebSocket integration for live synchronization of data across clients
- **Report Generation**: Download reports in PDF, CSV, or Excel formats
- **Secure Authentication**: JWT-based authentication with temporary password management

### Technologies Used
#### Frontend
- **React 18** with TypeScript for component-based UI development
- **Vite** for fast development and optimized production builds
- **Tailwind CSS** for responsive styling
- **React Router** for client-side routing
- **React Hot Toast** for user notifications
- **Lucide React** for consistent iconography
- **Recharts** for data visualization in analytics

#### Backend
- **FastAPI** for high-performance REST API development
- **SQLAlchemy** with MySQL for robust database operations
- **JWT (PyJWT)** for secure token-based authentication
- **WebSockets** for real-time bidirectional communication
- **Pydantic** for data validation and serialization
- **ReportLab** and **OpenPyXL** for report generation

#### Database
- **MySQL** for persistent data storage

## 🚀 Installation Instructions

### Prerequisites
- **Node.js** (v16 or higher) - for frontend development
- **Python** (v3.8 or higher) - for backend development
- **MySQL** (v5.7 or higher) - for database
- **Git** - for version control

### Step-by-Step Guide

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd training-management-system
   ```

2. **Backend Setup:**

   a. Navigate to the backend directory:
   ```bash
   cd backend
   ```

   b. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  / On Windows: venv\Scripts\activate
   ```

   c. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   d. Set up environment variables:
   Create a `.env` file in the backend directory:
   ```env
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=training_app
   SECRET_KEY=your-secret-key-here
   ```

3. **Frontend Setup:**

   a. Navigate to the root directory:
   ```bash
   cd ..
   ```

   b. Install Node.js dependencies:
   ```bash
   npm install
   ```

### Database Setup

1. **Start MySQL service** and ensure it's running on your system.

2. **Create the database:**
   The application will automatically create the database and tables when you run the backend for the first time.

3. **Load sample data (optional):**
   ```bash
   cd backend
   python -m backend.sample_data
   # On Windows, if error occurs:
   backend\venv\Scripts\python.exe -m backend.sample_data
   ```

   This will create sample users and sessions for testing.

### Running the Application

#### Option 1: Local Development (Manual Setup)

1. **Start the Backend Server:**
   ```bash
   cd backend
   source venv/bin/activate  
   
   # On Windows: venv\Scripts\activate

   python main.py
   ```

   if email error backend\venv\Scripts\pip install -r backend/requirements.txt
   
   The backend will start on `http://localhost:8002`

2. **Start the Frontend Development Server:**
   ```bash
   # In a new terminal, from the root directory
   cd frontend
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Access the Application:**
   Open your browser and navigate to `http://localhost:5173`

## 🔐 User Roles & Access

### Description of Roles
- **Admin**: Full system access including user management, session creation/editing, analytics viewing, and report generation
- **Trainer**: Can view users, create and manage training sessions, view assigned sessions
- **Trainee**: Limited access to view their own profile and assigned training sessions

### Admin-Only User Creation Flow
Administrators can create new users through the User Management interface. When creating a user:
1. Admin fills out user details (name, email, username, role)
2. Admin sets a temporary password
3. User account is created with `is_temporary_password` flag set to true
4. System broadcasts the new user creation via WebSocket for real-time updates

### Password Change Requirement
- All newly created users (trainers and trainees) are assigned temporary passwords
- Upon first login, users with temporary passwords are automatically redirected to the password change page
- Users must set a new password (minimum 6 characters) before accessing the main application
- The `is_temporary_password` flag is cleared after successful password change

## 🔄 Real-Time Functionality

### Frontend Connection to Backend
The frontend establishes a WebSocket connection to the backend at startup (after user authentication). The connection is maintained throughout the user session and automatically reconnects if lost.

### Real-Time Data Sync and Persistence
- **User Operations**: When users are created, updated, or deleted, the backend broadcasts events via WebSocket
- **Session Operations**: Session creation, updates, and deletions trigger real-time broadcasts
- **State Management**: The frontend AuthContext listens for WebSocket messages and updates the application state immediately
- **Persistence**: All changes are persisted to the MySQL database and synced across all connected clients

### Technologies Used for Real-Time Updates
- **WebSockets**: Bidirectional communication protocol for real-time data transfer
- **FastAPI WebSocket Support**: Built-in WebSocket endpoints in the backend
- **Connection Manager**: Custom ConnectionManager class handles multiple client connections and broadcasting
- **Event-Driven Updates**: Frontend uses React's useEffect and useCallback to handle WebSocket messages efficiently

## 📄 Report Generation

### How the "Generate Report" Button Works
Located in the Analytics section (accessible only to admins), the "Generate Report" button triggers a backend API call to `/reports/generate`. Users can select the desired format (PDF, CSV, or Excel) before generating.

### Format of Downloaded Reports
Reports include comprehensive data about users and sessions:
- **PDF**: Formatted document with tables showing user details and session information
- **CSV**: Comma-separated values file with user and session data in tabular format
- **Excel**: Multi-sheet workbook with separate sheets for Users and Sessions

### Backend Endpoint or Logic Used for Report Generation
- **Endpoint**: `GET /reports/generate?format={pdf|csv|excel}`
- **Authentication**: Requires admin role and valid JWT token
- **Libraries Used**:
  - **ReportLab** for PDF generation with tables and styling
  - **csv** module for CSV output
  - **OpenPyXL** for Excel file creation
- **Data Sources**: Fetches all users and sessions from the database using SQLAlchemy queries

## 🛠️ API Documentation

### List of Available Endpoints

#### Authentication
- `POST /auth/login` - User login with username/password
- `GET /health` - Health check endpoint

#### User Management
- `GET /users/` - List all users (admin/trainer)
- `GET /users/{user_id}` - Get specific user details
- `POST /users/` - Create new user (admin only)
- `PUT /users/{user_id}` - Update user (admin or self)
- `DELETE /users/{user_id}` - Delete user (admin only)

#### Session Management
- `GET /sessions/` - List all sessions
- `GET /sessions/{session_id}` - Get specific session details
- `POST /sessions/` - Create new session (admin/trainer)
- `PUT /sessions/{session_id}` - Update session (admin/trainer)
- `DELETE /sessions/{session_id}` - Delete session (admin only)

#### Analytics
- `GET /analytics/users` - User count by role (admin only)
- `GET /analytics/sessions` - Session count by status (admin only)

#### Reports
- `GET /reports/generate?format={pdf|csv|excel}` - Generate and download reports (admin only)

#### Real-Time
- `WebSocket /ws` - WebSocket endpoint for real-time updates

### Sample Requests and Responses

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin1234"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "first_name": "Admin",
    "last_name": "User",
    "is_temporary_password": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "force_password_change": false
}
```

#### Create User
```bash
POST /users/
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "first_name": "New",
  "last_name": "User",
  "role": "trainee",
  "password": "temppass123",
  "is_temporary_password": true
}
```

### Authentication and Authorization Details
- **JWT Authentication**: All protected endpoints require `Authorization: Bearer <token>` header
- **Token Expiration**: Access tokens expire after 30 minutes
- **Role-Based Access**: Certain endpoints restrict access based on user role
- **CORS**: Configured to allow requests from frontend URLs (`http://localhost:3000`, `http://localhost:5173`)

## 🧪 Testing & Deployment

### How to Run Tests
Currently, the project does not include automated tests. Manual testing can be performed by:
1. Running the application locally
2. Using the sample data script to populate test data
3. Testing user flows: login, user creation, session management, report generation
4. Verifying real-time updates by opening multiple browser tabs

### Production Deployment

Based on the project structure, here's a comprehensive step-by-step guide to deploy each part of the Training Management System. The project consists of three main components: Database (MySQL), Backend (FastAPI), and Frontend (React/Vite). Deployment assumes a production environment like a Linux server (e.g., Ubuntu) with root access. Adjust commands for your specific OS if needed.

#### Prerequisites for All Parts
- A server with SSH access (e.g., AWS EC2, DigitalOcean Droplet, or similar)
- Domain name (optional but recommended for HTTPS)
- SSL certificate (for HTTPS; can use Let's Encrypt)
- Basic knowledge of Linux commands
- Git installed on the server

#### Part 1: Database Deployment (MySQL)

1. **Install MySQL Server:**
   ```bash
   sudo apt update
   sudo apt install mysql-server
   sudo systemctl start mysql
   sudo systemctl enable mysql
   ```

2. **Secure MySQL Installation:**
   ```bash
   sudo mysql_secure_installation
   ```
   Follow the prompts to set a root password, remove anonymous users, disallow root login remotely, etc.

3. **Create Database and User:**
   ```bash
   sudo mysql -u root -p
   ```
   In MySQL shell:
   ```sql
   CREATE DATABASE training_app;
   CREATE USER 'training_user'@'localhost' IDENTIFIED BY 'secure_password_here';
   GRANT ALL PRIVILEGES ON training_app.* TO 'training_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Clone Repository and Run Database Setup:**
   ```bash
   git clone <repository-url>
   cd training-management-system
   sudo mysql -u root -p < database/setup_mysql.sql
   ```

   Alternatively, use the provided Python script (ensure Python and pymysql are installed):
   ```bash
   python scripts/setup_db.py
   ```

5. **Run Migrations (if any):**
   ```bash
   cd database/migrations
   # Run each SQL file in order, e.g.:
   sudo mysql -u training_user -p training_app < 20240601_add_password_change_log_table.sql
   # Repeat for other migration files as needed
   ```

6. **Optional: Load Sample Data:**
   ```bash
   cd ../..
   python3 -m backend.sample_data  # Ensure Python and dependencies are installed first
   ```

#### Part 2: Backend Deployment (FastAPI)

1. **Install Python and Virtual Environment:**
   ```bash
   sudo apt install python3 python3-pip python3-venv
   ```

2. **Clone Repository (if not already done):**
   ```bash
   git clone <repository-url>
   cd training-management-system/backend
   ```

3. **Create Virtual Environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set Up Environment Variables:**
   Create `.env` file in `backend/` directory:
   ```bash
   nano .env
   ```
   Add:
   ```
   DB_USER=training_user
   DB_PASSWORD=secure_password_here
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=training_app
   SECRET_KEY=very-secure-random-key-change-this
   CORS_ORIGINS=https://your-domain.com
   ```

6. **Run Database Migrations:**
   ```bash
   python run_migration.py
   ```

7. **Install Gunicorn:**
   ```bash
   pip install gunicorn
   ```

8. **Create Systemd Service for Backend:**
   ```bash
   sudo nano /etc/systemd/system/training-backend.service
   ```
   Add:
   ```
   [Unit]
   Description=Training Management Backend
   After=network.target

   [Service]
   User=ubuntu  # Change to your user
   WorkingDirectory=/path/to/training-management-system/backend
   Environment=PATH=/path/to/training-management-system/backend/venv/bin
   ExecStart=/path/to/training-management-system/backend/venv/bin/gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8002
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

9. **Start and Enable Service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start training-backend
   sudo systemctl enable training-backend
   ```

10. **Configure Firewall:**
    ```bash
    sudo ufw allow 8002
    ```

#### Part 3: Frontend Deployment (React/Vite)

1. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone Repository (if not already done):**
   ```bash
   git clone <repository-url>
   cd training-management-system
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

5. **Install Nginx:**
   ```bash
   sudo apt install nginx
   ```

6. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/training-app
   ```
   Add:
   ```
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       root /path/to/training-management-system/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://localhost:8002/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header Referrer-Policy "no-referrer-when-downgrade" always;
       add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
   }
   ```

7. **Enable Site and Restart Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/training-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Configure Firewall:**
   ```bash
   sudo ufw allow 'Nginx Full'
   ```

#### Additional Production Considerations

1. **SSL/HTTPS Setup (using Certbot):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

2. **Monitoring and Logging:**
   - Check backend logs: `sudo journalctl -u training-backend -f`
   - Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

3. **Backup Strategy:**
   - Set up automated MySQL backups
   - Backup application code and configs

4. **Security Hardening:**
   - Use strong passwords
   - Disable root SSH login
   - Keep software updated
   - Consider using a WAF (Web Application Firewall)

5. **Scaling (if needed):**
   - Use a load balancer for multiple backend instances
   - Consider containerization with Docker for easier deployment

After deployment, access the application at `https://your-domain.com`. The backend API will be available at `https://your-domain.com/api/`.

## 📎 Additional Notes

### Known Issues or Limitations
- WebSocket connections may drop during network interruptions (auto-reconnection implemented)
- Report generation for large datasets may take time
- No automated testing suite currently implemented
- Password reset functionality implemented (admins can reset user passwords)

### Future Improvements or Roadmap
- Implement automated testing with pytest and React Testing Library
- Add email notifications for session reminders
- Implement advanced analytics with charts and trends
- Add bulk user import/export functionality
- Implement password reset via email
- Add session attendance tracking and reporting
- Mobile-responsive design improvements
- API rate limiting and security enhancements

## Sample Login Credentials

After running the sample data script, you can use these credentials:

- **Admin:**
  - Username: `admin`
  - Password: `admin123`


## API Documentation

The FastAPI backend provides automatic API documentation at:
- Swagger UI: `http://localhost:8002/docs`
- ReDoc: `http://localhost:8002/redoc`

## Project Structure

```
training-management-system/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── crud.py              # Database operations
│   ├── database.py          # Database configuration
│   ├── sample_data.py       # Sample data script
│   ├── reporting.py         # Report generation logic
│   └── requirements.txt     # Python dependencies
├── src/
│   ├── components/          # React components
│   │   ├── Auth/           # Authentication components
│   │   ├── Dashboard/      # Dashboard components
│   │   ├── Layout/         # Layout components
│   │   ├── Sessions/       # Session management
│   │   ├── Users/          # User management
│   │   ├── Analytics/      # Analytics components
│   │   └── Settings/       # Settings components
│   ├── contexts/           # React contexts
│   ├── App.jsx             # Main app component
│   └── main.jsx            # App entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Node dependencies
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Development

- The backend uses auto-reload when running `python main.py`
- Database schema changes require manual migration or dropping/recreating tables

### Environment Variables

#### Backend (.env)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_HOST` - MySQL host (default: localhost)
- `DB_PORT` - MySQL port (default: 3306)
- `DB_NAME` - Database name (default: training_app)
- `SECRET_KEY` - JWT secret key
- 
DB_USER=training_user
DB_PASSWORD=training_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=training_app
SECRET_KEY=your-secret-key-here-change-this-in-production
## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.
