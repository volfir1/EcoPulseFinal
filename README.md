# ECO PULSE APPLICATION - USER MANUAL

## INTRODUCTION
This document provides step-by-step instructions for setting up and running the Eco Pulse application, a Django-React web application for environmental data analytics.

## PREREQUISITES
- Python 3.8+
- Node.js 14.0+
- npm 6.0+
- Git (optional)

## BACKEND SETUP

1. Redirect to backend PROJECT DIRECTORY
   ```
  
   cd backend
   ```

2. SET UP PYTHON VIRTUAL ENVIRONMENT
   Windows:
   ```
   py -m venv env
   env\Scripts\activate
   ```

   macOS/Linux:
   ```
   python3 -m venv env
   source env/bin/activate
   ```

3. INSTALL DEPENDENCIES FROM EXISTING REQUIREMENTS.TXT
   The project comes with a pre-configured requirements.txt file containing all necessary dependencies.
   ```
   pip install -r requirements.txt
   ```
   ```

   ```

7. START DJANGO SERVER
   ```
   python manage.py runserver
   ```
   Backend will be available at http://127.0.0.1:8000/

## FRONTEND SETUP

1. redirect to frontend REACT APP
  
   cd frontend
   ```

2. INSTALL REQUIRED PACKAGES
   ```
   npm install or npm i

3. CONFIGURE PROXY (OPTIONAL)
   Add to package.json:
   ```
   "proxy": "http://localhost:8000"
   ```

4. START DEVELOPMENT SERVER
   ```
   npm run start
   ```
   Frontend will be available at http://localhost:3000/

5. BUILD FOR PRODUCTION
   ```
   npm run build
   ```

## RUNNING THE APPLICATION

1. START BACKEND SERVER
   ```
   # From backend directory with virtual environment activated
   python manage.py runserver
   ```

2. START FRONTEND SERVER
   ```
   # From frontend directory
   npm start
   ```

3. ACCESS APPLICATION
   Open browser and go to http://localhost:3000/

## PROJECT STRUCTURE

```
django-react-app/
├── env/                    # Virtual environment
├── requirements.txt        # Python dependencies
├── backend/                # Django backend
│   ├── api/                # Django API app
│   └── backend/            # Django project settings
└── frontend/               # React frontend
    ├── public/             # Static files
    ├── src/                # React source code
    └── package.json        # Node.js dependencies
```

## TROUBLESHOOTING

1. PORT ALREADY IN USE
   - Change Django port: `python manage.py runserver 8001`
   - Change React port: `PORT=3001 npm start`

2. PACKAGE INSTALLATION FAILURES
   - Try installing specific versions: `npm install package-name@version`
   - Check Node.js/npm versions: `node -v && npm -v`

3. CORS ISSUES
   - Verify CORS settings in Django
   - Check browser console for errors

4. DATABASE CONNECTION ISSUES
   - Verify MongoDB connection string format
   - Check if MongoDB service is running

5. UPDATING REQUIREMENTS
   - To update requirements.txt: `pip freeze > requirements.txt`

## CONTACT & SUPPORT

For additional help, refer to:
- Django: https://docs.djangoproject.com/
- React: https://reactjs.org/docs/
- MongoDB: https://docs.mongodb.com/

---

FOR MOBILE:
EXPO FRONTEND SETUP



NAVIGATE TO PROJECT DIRECTORY
cd EcoPulseMobile

INSTALL REQUIRED PACKAGES
npm i

CONFIGURE BACKEND CONNECTION
Make sure a file named  in the project root with the following content:
 Get the IP address of your computer on the local network
// Run 'ipconfig' on Windows or 'ifconfig' on macOS/Linux to find it

export const API_URL = 'http://YOUR_LOCAL_IP_ADDRESS:8000';
// Example: export const API_URL = 'http://192.168.1.5:8000';


START DEVELOPMENT SERVER
expo start

only one backend will be used

for backend python in backend
py manage,py runserver 0.0.0.0:8000


Eco Pulse Application v1.0
Last updated: March 27, 2025