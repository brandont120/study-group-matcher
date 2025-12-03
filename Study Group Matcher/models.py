from extensions import db
from sqlalchemy.dialects.sqlite import BLOB
import uuid
from datetime import datetime

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    major = db.Column(db.String)
    study_style = db.Column(db.String)

    courses = db.relationship("UserCourses", back_populates="user")
    groups = db.relationship("GroupMembers", back_populates="user")


class Courses(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    course_name = db.Column(db.String, nullable=False)
    course_code = db.Column(db.String, unique=True)

    users = db.relationship("UserCourses", back_populates="course")
    groups = db.relationship("Groups", back_populates="course")


class UserCourses(db.Model):
    __tablename__ = "user_courses"

    user_id = db.Column(db.String, db.ForeignKey("users.id"), primary_key=True)
    course_id = db.Column(db.String, db.ForeignKey("courses.id"), primary_key=True)

    user = db.relationship("User", back_populates="courses")
    course = db.relationship("Courses", back_populates="users")


class Groups(db.Model):
    __tablename__ = "groups"

    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    name = db.Column(db.String, nullable=False)
    course_id = db.Column(db.String, db.ForeignKey("courses.id"))
    description = db.Column(db.String)
    max_members = db.Column(db.Integer)

    course = db.relationship("Courses", back_populates="groups")
    members = db.relationship("GroupMembers", back_populates="group")


class GroupMembers(db.Model):
    __tablename__ = "group_members"

    group_id = db.Column(db.String, db.ForeignKey("groups.id"), primary_key=True)
    user_id = db.Column(db.String, db.ForeignKey("users.id"), primary_key=True)
    role = db.Column(db.String)

    group = db.relationship("Groups", back_populates="members")
    user = db.relationship("User", back_populates="groups")


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    sender_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    recipient_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    sender = db.relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    recipient = db.relationship("User", foreign_keys=[recipient_id], backref="received_messages")
