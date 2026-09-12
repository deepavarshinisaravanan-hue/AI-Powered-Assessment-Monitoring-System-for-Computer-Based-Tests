from sqlalchemy.orm import Session

from app.models.exam import Exam
from app.models.question import Question
from app.models.user import User
from app.services.auth_service import hash_password


def seed_demo_data(db: Session) -> None:
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            name="Admin User",
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            role="admin",
            is_active=True,
        )
        db.add(admin)

    student = db.query(User).filter(User.email == "student@example.com").first()
    if not student:
        student = User(
            name="Student User",
            email="student@example.com",
            password_hash=hash_password("student123"),
            role="student",
            is_active=True,
        )
        db.add(student)

    db.commit()

    if db.query(Exam).count() == 0:
        exam = Exam(
            title="Demo Assessment",
            description="Sample assessment for frontend verification.",
            duration_minutes=45,
            status="published",
        )
        db.add(exam)
        db.commit()
        db.refresh(exam)

        question = Question(
            exam_id=exam.id,
            question_text="What is the purpose of the Assessment Monitoring System?",
            option_a="To make coffee",
            option_b="To monitor assessments and track student activity",
            option_c="To create music playlists",
            option_d="To design logos",
            correct_option="B",
            difficulty="easy",
        )
        db.add(question)
        db.commit()
