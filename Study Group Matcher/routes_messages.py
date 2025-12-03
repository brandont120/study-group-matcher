from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Message
from extensions import db
from sqlalchemy import or_, desc

messages_bp = Blueprint("messages", __name__, url_prefix="/api/messages")


@messages_bp.post("")
@jwt_required()
def send_message():
    data = request.get_json() or {}
    sender_id = get_jwt_identity()
    recipient_id = data.get("recipient_id")
    text = data.get("text", "").strip()

    if not recipient_id or not text:
        return jsonify({"error": "recipient_id and text are required"}), 400

    recipient = User.query.get(recipient_id)
    if not recipient:
        return jsonify({"error": "Recipient not found"}), 404

    msg = Message(sender_id=sender_id, recipient_id=recipient_id, text=text)
    db.session.add(msg)
    db.session.commit()

    return jsonify({
        "id": msg.id,
        "from": sender_id,
        "to": recipient_id,
        "text": msg.text,
        "timestamp": msg.timestamp.isoformat()
    }), 201


@messages_bp.get("/conversations")
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()

    # find all messages where user is sender or recipient
    msgs = Message.query.filter(or_(Message.sender_id == user_id, Message.recipient_id == user_id)).order_by(desc(Message.timestamp)).all()

    partners = {}
    for m in msgs:
        other_id = m.recipient_id if m.sender_id == user_id else m.sender_id
        if other_id not in partners:
            partners[other_id] = {
                "with": other_id,
                "last_message": {
                    "id": m.id,
                    "from": m.sender_id,
                    "to": m.recipient_id,
                    "text": m.text,
                    "timestamp": m.timestamp.isoformat()
                }
            }

    # attach basic user info
    result = []
    for other_id, meta in partners.items():
        user = User.query.get(other_id)
        result.append({
            "user": {"id": user.id, "name": user.name, "email": user.email} if user else {"id": other_id},
            "last_message": meta["last_message"]
        })

    # sort by last message timestamp (already from messages ordering)
    return jsonify(result), 200


@messages_bp.get("/<other_id>")
@jwt_required()
def get_conversation(other_id):
    user_id = get_jwt_identity()

    msgs = Message.query.filter(
        ((Message.sender_id == user_id) & (Message.recipient_id == other_id)) |
        ((Message.sender_id == other_id) & (Message.recipient_id == user_id))
    ).order_by(Message.timestamp.asc()).all()

    out = [{
        "id": m.id,
        "from": m.sender_id,
        "to": m.recipient_id,
        "text": m.text,
        "timestamp": m.timestamp.isoformat()
    } for m in msgs]

    return jsonify({"messages": out, "with": other_id}), 200


@messages_bp.get('/users/search')
def search_users():
    q = request.args.get('q', '').strip().lower()
    if not q:
        return jsonify({"users": []}), 200

    results = User.query.filter(
        (User.name.ilike(f"%{q}%")) |
        (User.email.ilike(f"%{q}%")) |
        (User.major.ilike(f"%{q}%")) |
        (User.study_style.ilike(f"%{q}%"))
    ).limit(30).all()

    users = [{"id": u.id, "name": u.name, "email": u.email, "major": u.major, "study_style": u.study_style} for u in results]
    return jsonify({"users": users}), 200
