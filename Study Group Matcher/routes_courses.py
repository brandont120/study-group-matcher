from flask import Blueprint, request, jsonify
from models import User, Courses, UserCourses
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

courses_bp = Blueprint("courses", __name__, url_prefix="/api/courses")


# Get all courses
@courses_bp.get("")
def get_all_courses():
    courses = Courses.query.all()
    return jsonify([{
        "id": c.id,
        "course_name": c.course_name,
        "course_code": c.course_code,
        "users_count": len(c.users)
    } for c in courses])


# Create course (admin only)
@courses_bp.post("")
def create_course():
    data = request.get_json() or {}
    
    course_name = data.get("course_name")
    course_code = data.get("course_code")
    
    if not course_name or not course_code:
        return jsonify({"error": "course_name and course_code required"}), 400
    
    # Check if course code already exists
    if Courses.query.filter_by(course_code=course_code).first():
        return jsonify({"error": "Course code already exists"}), 400
    
    course = Courses(course_name=course_name, course_code=course_code)
    db.session.add(course)
    db.session.commit()
    
    return jsonify({
        "id": course.id,
        "course_name": course.course_name,
        "course_code": course.course_code,
        "message": "Course created successfully"
    }), 201


# Enroll user in course
@courses_bp.post("/<course_id>/enroll")
@jwt_required()
def enroll_course(course_id):
    user_id = get_jwt_identity()
    
    # Verify course exists
    course = Courses.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    # Check if already enrolled
    existing = UserCourses.query.filter_by(user_id=user_id, course_id=course_id).first()
    if existing:
        return jsonify({"error": "Already enrolled in this course"}), 400
    
    enrollment = UserCourses(user_id=user_id, course_id=course_id)
    db.session.add(enrollment)
    db.session.commit()
    
    return jsonify({"message": "Enrolled successfully"}), 201


# Unenroll user from course
@courses_bp.post("/<course_id>/unenroll")
@jwt_required()
def unenroll_course(course_id):
    user_id = get_jwt_identity()
    
    enrollment = UserCourses.query.filter_by(user_id=user_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"error": "Not enrolled in this course"}), 404
    
    db.session.delete(enrollment)
    db.session.commit()
    
    return jsonify({"message": "Unenrolled successfully"})


# Get user's courses
@courses_bp.get("/user/mycourses")
@jwt_required()
def get_user_courses():
    user_id = get_jwt_identity()
    enrollments = UserCourses.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        "id": e.course.id,
        "course_name": e.course.course_name,
        "course_code": e.course.course_code
    } for e in enrollments])


# Get students in a course
@courses_bp.get("/<course_id>/students")
def get_course_students(course_id):
    course = Courses.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    return jsonify([{
        "id": e.user.id,
        "name": e.user.name,
        "email": e.user.email,
        "major": e.user.major,
        "study_style": e.user.study_style
    } for e in course.users])
