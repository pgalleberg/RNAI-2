## How to run the project

The steps below assume that:

1. Current working directory is `./RNAI-2`
2. Python version 3.10.13 is installed
3. virtualenv is installed
4. redis is installed
5. Node.js and npm is installed
6. You are using MacOS

### Step 1 - Run the react application

```
cd rnai-step-0
npm install
npm run start
```

### Step 2 - Start redis

```
redis-server
```

### Step 3 - Create a python virtual environment (first time only)

```
cd backend
virtualenv env
```

### Step 4 - Install python dependencies

```
cd backend
source env/bin/activate
pip install -r requirements.txt
```

### Step 5 - Run the flask application

```
cd backend
source env/bin/activate
flask run
```

### Step 6 - Run celery

```
cd backend
source env/bin/activate
celery -A app:celery worker --loglevel=INFO > ../logs/celery.log 2>&1
```

## Step 7 - Run flower (optional)

```
cd backend
source env/bin/activate
celery -A app:celery flower
```
