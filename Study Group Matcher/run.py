from app import app, db

with app.app_context():
    print("Creating database...")
    db.create_all()
    print("Database created successfully!")

if __name__ == "__main__":
    print("Starting Study Group Matcher server...")
    print("Frontend should be running on http://localhost:5173")
    print("Backend is running on http://localhost:5000")
    app.run(debug=True, port=5000)
