from app import app, db

with app.app_context():
    print("Creating database...")
    db.create_all()
    print("Database created successfully!")
