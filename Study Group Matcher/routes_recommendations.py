from flask import Blueprint, request, jsonify
from models import User, Courses, UserCourses
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, func

recommendations_bp = Blueprint("recommendations", __name__, url_prefix="/api/recommendations")


# Algorithm to find matching study partners
def calculate_match_score(current_user, other_user):
    """Calculate match score between two users based on shared courses and study style"""
    score = 0
    
    # Get current user's courses
    current_courses = set(c.course_id for c in current_user.courses)
    other_courses = set(c.course_id for c in other_user.courses)
    
    # Shared courses (weight: 3)
    shared_courses = current_courses & other_courses
    score += len(shared_courses) * 3
    
    # Study style match (weight: 2)
    if current_user.study_style and other_user.study_style:
        if current_user.study_style == other_user.study_style:
            score += 2
    
    # Major match (weight: 1)
    if current_user.major and other_user.major:
        if current_user.major == other_user.major:
            score += 1
    
    return score


# Get recommended study partners
@recommendations_bp.get("/partners")
@jwt_required()
def get_partner_recommendations():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    # Get all other users
    all_users = User.query.filter(User.id != user_id).all()
    
    # Calculate match scores
    matches = []
    for user in all_users:
        score = calculate_match_score(current_user, user)
        if score > 0:  # Only include users with at least one common factor
            matches.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "major": user.major,
                "study_style": user.study_style,
                "score": score,
                "shared_courses": len(set(c.course_id for c in current_user.courses) & 
                                     set(c.course_id for c in user.courses))
            })
    
    # Sort by score (highest first)
    matches.sort(key=lambda x: x["score"], reverse=True)
    
    return jsonify(matches[:10])  # Return top 10 matches


# Get recommended groups for user
@recommendations_bp.get("/groups")
@jwt_required()
def get_group_recommendations():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    # Get user's current groups
    from models import GroupMembers, Groups
    user_groups = set(m.group_id for m in GroupMembers.query.filter_by(user_id=user_id).all())
    
    # Get user's courses
    user_courses = set(c.course_id for c in current_user.courses)
    
    # Find groups in user's courses that they're not already in
    recommended = []
    for course_id in user_courses:
        groups = Groups.query.filter_by(course_id=course_id).all()
        for group in groups:
            if group.id not in user_groups and len(group.members) < group.max_members:
                recommended.append({
                    "id": group.id,
                    "name": group.name,
                    "course_id": group.course_id,
                    "description": group.description,
                    "members_count": len(group.members),
                    "max_members": group.max_members
                })
    
    return jsonify(recommended)
