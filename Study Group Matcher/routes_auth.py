from flask import Blueprint, request, jsonify
from models import User
from extensions import db, bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity


auth = Blueprint("auth", __name__, url_prefix="/api/auth")


# SIGNUP
@auth.post("/signup")
def signup():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    major = data.get("major")
    study_style = data.get("study_style")

    if not email or not password or not name:
        return jsonify({"error": "name, email and password required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    user = User(
        name=name,
        email=email,
        password_hash=hashed_pw,
        major=major,
        study_style=study_style,
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created successfully", "user": {"id": user.id, "email": user.email}}), 201


# LOGIN
@auth.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user": {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }})


# UPDATE PROFILE
@auth.put("/profile")
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}

    user.name = data.get("name", user.name)
    user.major = data.get("major", user.major)
    user.study_style = data.get("study_style", user.study_style)

    db.session.commit()

    return jsonify({"message": "Profile updated", "user": {
        "id": user.id,
        "name": user.name,
        "major": user.major,
        "study_style": user.study_style,
    }})


# GET PROFILE
@auth.get("/profile")
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "major": user.major,
        "study_style": user.study_style,
    })
