Running the integrated app (frontend + backend)

Development workflow:

- Start the Flask backend (from `Study Group Matcher` folder):

```powershell
cd "Study Group Matcher"
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

- Start the frontend (from repo root):

```powershell
npm install
npm run dev
```

The Vite dev server proxies `/api/*` requests to the Flask backend on `http://localhost:5000`.

Production build (single deployable served by Flask):

```powershell
npm run build
# the `postbuild` script will copy files into the backend static/templates folders
npm run build
```

Then run the Flask app; if the frontend `dist` was copied into `Study Group Matcher/static` and `Study Group Matcher/templates`, Flask will serve the built frontend.