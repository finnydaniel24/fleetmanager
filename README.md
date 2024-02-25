# fleetmanager
steps:-
1. clone the project in your local machine
2. create python virtual environment.
   commands:-
   ```bash
   cd <select this project directory>
   ```
   ```bash
   python -m venv venv
   ```
4. activate the virtual environment.
   command:-
   ```bash
   source venv/bin/activate
   ```
6. Install all project dependencies or requirement
   commands:-
   ```bash
   pip install -r src/requirements.txt
   ```
8. update databse_url in dbConfig.py file.
9. now run project
   command:-
   ```bash
   uvicorn src.main:app
   ```
   
