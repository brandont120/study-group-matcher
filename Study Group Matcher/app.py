from flask import Flask, render_template, request, redirect, session, send_from_directory
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import os

from extensions import db as database, bcrypt, jwt
from routes_auth import auth as auth_blueprint


app = Flask(__name__)
app.secret_key = "devkey"

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///study.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# JWT secret for API tokens (use env var in production)
app.config["JWT_SECRET_KEY"] = "dev-jwt-secret"

# initialize extensions
database.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

# enable CORS for API endpoints during development
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# register API blueprints
app.register_blueprint(auth_blueprint)


@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        new_user = User(
            name=request.form["name"],
            email=request.form["email"],
            major=request.form.get("major"),
            study_style=request.form.get("study_style"),
            password_hash=generate_password_hash(request.form["password"])
        )
        db.session.add(new_user)
        db.session.commit()
        return redirect("/login")

    return render_template("signup.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            session["user_id"] = user.id
            return redirect("/profile")

    return render_template("login.html")


@app.route("/profile", methods=["GET", "POST"])
def profile():
    if "user_id" not in session:
        return redirect("/login")

    user = User.query.get(session["user_id"])

    if request.method == "POST":
        user.name = request.form["name"]
        user.major = request.form["major"]
        user.study_style = request.form["study_style"]
        db.session.commit()

    return render_template("profile.html", user=user)


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

if __name__ == "__main__":
    app.run(debug=True)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # If a built React app is present in ../dist, serve it. Otherwise fall back to template routes.
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist'))
    if os.path.exists(dist_dir):
        if path != "" and os.path.exists(os.path.join(dist_dir, path)):
            return send_from_directory(dist_dir, path)
        index_path = os.path.join(dist_dir, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(dist_dir, 'index.html')
    # dist not present; let existing template routes handle the request
    # return 404 to allow Flask to try other routes
    return "Not Found", 404