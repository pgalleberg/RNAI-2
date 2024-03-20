## How to run the project

The steps below assume that:

1. Current working directory is `./RNAI-2`
2. Python version 3.10.13 is installed
3. virtualenv is installed
4. redis is installed
5. Node.js and npm is installed
6. You are using MacOS

### Step 0 - Set up .env file

```
cd rnai-step-0
cp .example-env .env
nano .env #populate the API keys
```

### Step 1 - Run the react application

```
cd rnai-step-0
npm install
npm run start
```

### Step 2 - Set up the backend .env file and serviceAccountKey.json

```
cd backend
cp .example-env .env
nano .env #populate the API keys

cp .example-serviceAccountKey.json .serviceAccountKey.json
nano .serviceAccountKey.json
```

### Step 3 - Start redis

```
redis-server
```

### Step 4 - Create a python virtual environment (first time only)

```
cd backend
virtualenv env
```

### Step 5 - Install python dependencies

```
cd backend
source env/bin/activate
pip install -r requirements.txt
```

### Step 6 - Run the flask application

```
cd backend
source env/bin/activate
flask run
```

### Step 7 - Run celery

```
cd backend
source env/bin/activate
celery -A app:celery worker --loglevel=INFO > ../logs/celery.log 2>&1
```

## Step 8 - Run flower (optional)

```
cd backend
source env/bin/activate
celery -A app:celery flower
```
