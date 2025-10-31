from sqlalchemy.orm import Session
from sqlalchemy import and_
from passlib.context import CryptContext
from typing import List, Optional
from datetime import datetime, timezone
import secrets
import string
import pytz
import uuid

from database import models
from backend import schemas

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_users_by_role(db: Session, role: models.UserRole):
    return db.query(models.User).filter(models.User.role == role).all()

def generate_temporary_password(length: int = 12):
    """Generate a secure random temporary password."""
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(characters) for _ in range(length))

def create_user(db: Session, user: schemas.UserCreate):
    # Generate a random temporary password
    temporary_password = generate_temporary_password()
    hashed_password = pwd_context.hash(temporary_password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        is_temporary_password=user.is_temporary_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # Return both the user and the plain text temporary password for secure sharing
    return db_user, temporary_password

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None

    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = pwd_context.hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        # Delete related records to avoid foreign key constraint errors
        # Delete PasswordChangeLog entries
        db.query(models.PasswordChangeLog).filter(
            (models.PasswordChangeLog.user_id == user_id) | (models.PasswordChangeLog.performed_by == user_id)
        ).delete()
        # Delete AssignedStudent assignments
        db.query(models.AssignedStudent).filter(
            (models.AssignedStudent.student_id == user_id) | (models.AssignedStudent.teacher_id == user_id)
        ).delete()
        # Delete SessionTrainee records
        db.query(models.SessionTrainee).filter(models.SessionTrainee.trainee_id == user_id).delete()
        # Delete Session records where user is trainer
        db.query(models.Session).filter(models.Session.trainer_id == user_id).delete()
        # Now delete the user
        db.delete(db_user)
        db.commit()
        return True
    return False

def authenticate_user(db: Session, username: str, password: str):
    # Try to find user by username first
    user = get_user_by_username(db, username)
    if not user:
        # If not found by username, try by email
        user = get_user_by_email(db, username)
    if not user:
        return False
    if not pwd_context.verify(password, user.password_hash):
        return False
    return user

def change_password(db: Session, user_id: int, new_password: str, performed_by: int = None):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None

    hashed_password = pwd_context.hash(new_password)
    db_user.password_hash = hashed_password
    db_user.is_temporary_password = False
    db_user.updated_at = datetime.utcnow()

    # Log the password change
    log_entry = models.PasswordChangeLog(
        user_id=user_id,
        action='changed',
        performed_by=performed_by,
        details=f"Password changed by {'self' if performed_by == user_id else 'admin'}"
    )
    db.add(log_entry)

    db.commit()
    db.refresh(db_user)
    return db_user

def reset_password(db: Session, user_id: int, new_password: str, performed_by: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None

    hashed_password = pwd_context.hash(new_password)
    db_user.password_hash = hashed_password
    db_user.is_temporary_password = True
    db_user.updated_at = datetime.utcnow()

    # Log the password reset
    log_entry = models.PasswordChangeLog(
        user_id=user_id,
        action='reset',
        performed_by=performed_by,
        details="Password reset by admin"
    )
    db.add(log_entry)

    db.commit()
    db.refresh(db_user)
    return db_user

def log_user_creation(db: Session, user_id: int, performed_by: int):
    log_entry = models.PasswordChangeLog(
        user_id=user_id,
        action='created',
        performed_by=performed_by,
        details="User account created"
    )
    db.add(log_entry)
    db.commit()

# Session CRUD operations
def get_session(db: Session, session_id: int):
    return db.query(models.Session).filter(models.Session.id == session_id).first()

def get_sessions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Session).offset(skip).limit(limit).all()

def get_sessions_by_trainer(db: Session, trainer_id: int):
    return db.query(models.Session).filter(models.Session.trainer_id == trainer_id).all()

def get_sessions_by_trainee(db: Session, trainee_id: int):
    return db.query(models.Session).join(models.SessionTrainee).filter(models.SessionTrainee.trainee_id == trainee_id).all()

def get_sessions_by_status(db: Session, status: models.SessionStatus):
    return db.query(models.Session).filter(models.Session.status == status).all()

def generate_unique_session_link():
    """Generate a unique session link using UUID."""
    return str(uuid.uuid4())

def get_session_by_session_link(db: Session, session_link: str):
    """Get session by session_link."""
    return db.query(models.Session).filter(models.Session.session_link == session_link).first()

def create_session(db: Session, session: schemas.SessionCreate):
    session_data = session.dict()
    trainees = session_data.pop('trainees', [])

    # Set creation time in IST
    ist = pytz.timezone('Asia/Kolkata')
    now_utc = datetime.now(timezone.utc)
    now_ist = now_utc.astimezone(ist)

    session_data['created_at'] = now_ist
    session_data['updated_at'] = now_ist

    # Generate unique session link if not provided
    if not session_data.get('session_link'):
        session_data['session_link'] = generate_unique_session_link()

    db_session = models.Session(**session_data)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    # Add trainees
    for trainee_id in trainees:
        session_trainee = models.SessionTrainee(session_id=db_session.id, trainee_id=trainee_id)
        db.add(session_trainee)
    db.commit()

    return db_session

def update_session(db: Session, session_id: int, session_update: schemas.SessionUpdate):
    db_session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not db_session:
        return None

    update_data = session_update.dict(exclude_unset=True)
    trainees = update_data.pop('trainees', None)

    for field, value in update_data.items():
        setattr(db_session, field, value)

    if trainees is not None:
        # Remove existing trainees
        db.query(models.SessionTrainee).filter(models.SessionTrainee.session_id == session_id).delete()
        # Add new trainees
        for trainee_id in trainees:
            session_trainee = models.SessionTrainee(session_id=session_id, trainee_id=trainee_id)
            db.add(session_trainee)

    db_session.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_session)
    return db_session

def add_trainee_to_session(db: Session, session_id: int, trainee_id: int):
    # Check if already added
    existing = db.query(models.SessionTrainee).filter(
        models.SessionTrainee.session_id == session_id,
        models.SessionTrainee.trainee_id == trainee_id
    ).first()
    if existing:
        return existing

    session_trainee = models.SessionTrainee(session_id=session_id, trainee_id=trainee_id)
    db.add(session_trainee)
    db.commit()
    db.refresh(session_trainee)
    return session_trainee

def remove_trainee_from_session(db: Session, session_id: int, trainee_id: int):
    session_trainee = db.query(models.SessionTrainee).filter(
        models.SessionTrainee.session_id == session_id,
        models.SessionTrainee.trainee_id == trainee_id
    ).first()
    if session_trainee:
        db.delete(session_trainee)
        db.commit()
        return True
    return False

def get_session_trainees(db: Session, session_id: int):
    return db.query(models.SessionTrainee).filter(models.SessionTrainee.session_id == session_id).all()

def delete_session(db: Session, session_id: int):
    db_session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if db_session:
        # Delete associated trainees
        db.query(models.SessionTrainee).filter(models.SessionTrainee.session_id == session_id).delete()
        db.delete(db_session)
        db.commit()
        return True
    return False

# Analytics helper functions
def get_user_count_by_role(db: Session):
    from sqlalchemy import func
    result = db.query(models.User.role, func.count(models.User.id)).group_by(models.User.role).all()
    return {role.value: count for role, count in result}

def get_session_count_by_status(db: Session):
    from sqlalchemy import func
    result = db.query(models.Session.status, func.count(models.Session.id)).group_by(models.Session.status).all()
    return {status.value: count for status, count in result}
def get_assigned_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AssignedStudent).offset(skip).limit(limit).all()

def get_assigned_student(db: Session, assignment_id: int):
    return db.query(models.AssignedStudent).filter(models.AssignedStudent.id == assignment_id).first()

def get_assignments_by_teacher(db: Session, teacher_id: int):
    return db.query(models.AssignedStudent).filter(models.AssignedStudent.teacher_id == teacher_id).all()

def get_assignments_by_student(db: Session, student_id: int):
    return db.query(models.AssignedStudent).filter(models.AssignedStudent.student_id == student_id).all()

def assign_student_to_teacher(db: Session, student_id: int, teacher_id: int):
    # Check if already assigned
    existing = db.query(models.AssignedStudent).filter(
        models.AssignedStudent.student_id == student_id,
        models.AssignedStudent.teacher_id == teacher_id
    ).first()
    if existing:
        return existing

    assignment = models.AssignedStudent(student_id=student_id, teacher_id=teacher_id, assigned_date=datetime.now(timezone.utc))
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

def unassign_student_from_teacher(db: Session, student_id: int, teacher_id: int):
    assignment = db.query(models.AssignedStudent).filter(
        models.AssignedStudent.student_id == student_id,
        models.AssignedStudent.teacher_id == teacher_id
    ).first()
    if assignment:
        db.delete(assignment)
        db.commit()
        return True
    return False

# Attendance CRUD operations
def get_attendance(db: Session, attendance_id: int):
    return db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()

def get_attendance_for_session(db: Session, session_id: int):
    return db.query(models.Attendance).filter(models.Attendance.session_id == session_id).all()

def get_attendance_for_trainee(db: Session, trainee_id: int):
    return db.query(models.Attendance).filter(models.Attendance.trainee_id == trainee_id).all()

def mark_attendance(db: Session, session_id: int, trainee_id: int, present: bool):
    # Check if already marked
    existing = db.query(models.Attendance).filter(
        models.Attendance.session_id == session_id,
        models.Attendance.trainee_id == trainee_id
    ).first()
    if existing:
        existing.present = present
        existing.marked_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    attendance = models.Attendance(session_id=session_id, trainee_id=trainee_id, present=present)
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance

def update_attendance(db: Session, attendance_id: int, present: bool):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if attendance:
        attendance.present = present
        attendance.marked_at = datetime.utcnow()
        db.commit()
        db.refresh(attendance)
        return attendance
    return None

def delete_attendance(db: Session, attendance_id: int):
    attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id).first()
    if attendance:
        db.delete(attendance)
        db.commit()
        return True
    return False

def get_trainee_progress(db: Session, trainee_id: int):
    # Get all sessions the trainee is enrolled in
    enrolled_sessions = db.query(models.SessionTrainee).filter(models.SessionTrainee.trainee_id == trainee_id).all()
    total_sessions = len(enrolled_sessions)

    if total_sessions == 0:
        return {
            "trainee_id": trainee_id,
            "total_sessions": 0,
            "attended_sessions": 0,
            "progress_percentage": 0.0
        }

    # Get attended sessions (present=True)
    attended_count = db.query(models.Attendance).filter(
        models.Attendance.trainee_id == trainee_id,
        models.Attendance.present == True
    ).count()

    progress_percentage = (attended_count / total_sessions) * 100

    return {
        "trainee_id": trainee_id,
        "total_sessions": total_sessions,
        "attended_sessions": attended_count,
        "progress_percentage": round(progress_percentage, 2)
    }

def get_trainees_progress_for_trainer(db: Session, trainer_id: int):
    # Get trainees assigned to this trainer
    assignments = db.query(models.AssignedStudent).filter(models.AssignedStudent.teacher_id == trainer_id).all()
    trainee_ids = [a.student_id for a in assignments]

    progress_list = []
    for trainee_id in trainee_ids:
        progress = get_trainee_progress(db, trainee_id)
        trainee = get_user(db, trainee_id)
        progress["trainee"] = trainee
        progress_list.append(progress)

    return progress_list

def get_trainees_for_trainer(db: Session, trainer_id: int):
    from datetime import timedelta
    # Get all trainees assigned to this trainer
    assignments = db.query(models.AssignedStudent).filter(models.AssignedStudent.teacher_id == trainer_id).all()

    result = []
    for assignment in assignments:
        trainee = assignment.student
        # Get sessions created by this trainer that include this trainee
        sessions = db.query(models.Session).join(models.SessionTrainee).filter(
            models.Session.trainer_id == trainer_id,
            models.SessionTrainee.trainee_id == trainee.id
        ).all()

        sessions_data = [{
            'id': session.id,
            'title': session.title,
            'created_at': session.created_at
        } for session in sessions]

        sessions_count = len(sessions_data)
        # Get last active: max of session created_at or attendance marked_at
        last_session_date = max([s['created_at'] for s in sessions_data]) if sessions_data else None
        # Get last attendance in any session with this trainer
        last_attendance = db.query(models.Attendance).join(models.Session).filter(
            models.Attendance.trainee_id == trainee.id,
            models.Session.trainer_id == trainer_id
        ).order_by(models.Attendance.marked_at.desc()).first()
        last_attendance_date = last_attendance.marked_at if last_attendance else None
        last_active = max([d for d in [last_session_date, last_attendance_date] if d], default=None)
        # Status: active if last active within 30 days
        status = 'active' if last_active and (datetime.now(timezone.utc) - last_active) < timedelta(days=30) else 'inactive'

        result.append({
            'trainee': trainee,
            'sessions': sessions_data,
            'sessions_count': sessions_count,
            'last_active': last_active,
            'status': status
        })

    return result
