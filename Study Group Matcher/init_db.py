from app import app
from extensions import db
from models import Courses

def init_sample_data():
    """Initialize sample courses in the database"""
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if courses already exist
        if Courses.query.first():
            print("Courses already exist in database")
            return
        
        # Sample courses
        courses_data = [
            ("Introduction to Computer Science", "CS101"),
            ("Data Structures", "CS201"),
            ("Algorithms", "CS202"),
            ("Web Development", "CS301"),
            ("Database Design", "CS302"),
            ("Calculus I", "MATH101"),
            ("Calculus II", "MATH102"),
            ("Linear Algebra", "MATH201"),
            ("Physics I", "PHYS101"),
            ("Physics II", "PHYS102"),
            ("Chemistry I", "CHEM101"),
            ("Organic Chemistry", "CHEM201"),
            ("Biology I", "BIO101"),
            ("Molecular Biology", "BIO201"),
            ("English Composition", "ENG101"),
            ("American History", "HIST101"),
            ("World History", "HIST201"),
        ]
        
        for course_name, course_code in courses_data:
            course = Courses(course_name=course_name, course_code=course_code)
            db.session.add(course)
        
        db.session.commit()
        print(f"Created {len(courses_data)} sample courses")

if __name__ == "__main__":
    init_sample_data()
