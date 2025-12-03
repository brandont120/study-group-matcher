from flask import Blueprint, request, jsonify
from models import User, Courses, UserCourses, Groups, GroupMembers
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

groups_bp = Blueprint("groups", __name__, url_prefix="/api/groups")


# Get all groups
@groups_bp.get("")
def get_all_groups():
    groups = Groups.query.all()
    return jsonify([{
        "id": g.id,
        "name": g.name,
        "course_id": g.course_id,
        "description": g.description,
        "max_members": g.max_members,
        "members_count": len(g.members)
    } for g in groups])


# Get groups for a specific course
@groups_bp.get("/course/<course_id>")
def get_groups_by_course(course_id):
    groups = Groups.query.filter_by(course_id=course_id).all()
    return jsonify([{
        "id": g.id,
        "name": g.name,
        "course_id": g.course_id,
        "description": g.description,
        "max_members": g.max_members,
        "members_count": len(g.members)
    } for g in groups])


# Get group details
@groups_bp.get("/<group_id>")
def get_group(group_id):
    group = Groups.query.get(group_id)
    if not group:
        return jsonify({"error": "Group not found"}), 404
    
    return jsonify({
        "id": group.id,
        "name": group.name,
        "course_id": group.course_id,
        "description": group.description,
        "max_members": group.max_members,
        "members": [{
            "id": m.user.id,
            "name": m.user.name,
            "email": m.user.email,
            "role": m.role
        } for m in group.members]
    })


# Create group
@groups_bp.post("")
@jwt_required()
def create_group():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    name = data.get("name")
    course_id = data.get("course_id")
    description = data.get("description", "")
    max_members = data.get("max_members", 5)
    
    if not name or not course_id:
        return jsonify({"error": "name and course_id required"}), 400
    
    # Verify course exists
    course = Courses.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    
    group = Groups(
        name=name,
        course_id=course_id,
        description=description,
        max_members=max_members
    )
    
    db.session.add(group)
    db.session.flush()
    
    # Add creator as admin
    member = GroupMembers(group_id=group.id, user_id=user_id, role="admin")
    db.session.add(member)
    db.session.commit()
    
    return jsonify({
        "id": group.id,
        "name": group.name,
        "message": "Group created successfully"
    }), 201


# Join group
@groups_bp.post("/<group_id>/join")
@jwt_required()
def join_group(group_id):
    user_id = get_jwt_identity()
    group = Groups.query.get(group_id)
    
    if not group:
        return jsonify({"error": "Group not found"}), 404
    
    # Check if already a member
    existing = GroupMembers.query.filter_by(group_id=group_id, user_id=user_id).first()
    if existing:
        return jsonify({"error": "Already a member of this group"}), 400
    
    # Check if group is full
    if len(group.members) >= group.max_members:
        return jsonify({"error": "Group is full"}), 400
    
    member = GroupMembers(group_id=group_id, user_id=user_id, role="member")
    db.session.add(member)
    db.session.commit()
    
    return jsonify({"message": "Joined group successfully"}), 201


# Leave group
@groups_bp.post("/<group_id>/leave")
@jwt_required()
def leave_group(group_id):
    user_id = get_jwt_identity()
    
    member = GroupMembers.query.filter_by(group_id=group_id, user_id=user_id).first()
    if not member:
        return jsonify({"error": "Not a member of this group"}), 404
    
    db.session.delete(member)
    db.session.commit()
    
    return jsonify({"message": "Left group successfully"})


# Get user's groups
@groups_bp.get("/user/mygroups")
@jwt_required()
def get_user_groups():
    user_id = get_jwt_identity()
    memberships = GroupMembers.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        "id": m.group.id,
        "name": m.group.name,
        "course_id": m.group.course_id,
        "description": m.group.description,
        "role": m.role,
        "members_count": len(m.group.members)
    } for m in memberships])
