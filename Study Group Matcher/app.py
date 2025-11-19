from flask import Flask, render_template, request, redirect, session
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "devkey"

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///study.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


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