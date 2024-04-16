#!/bin/bash

# Navigate to your project directory
# cd /Users/esha/Desktop/RNAI-2/grants

# Activate the virtual environment
source env_grants/bin/activate

# Start Celery worker in the background
celery -A utils:celery worker --loglevel=INFO > ./logs/celery.log 2>&1 &
CELERY_PID=$!
echo "Celery_pid ${CELERY_PID}"

# Run your main Python script
python main.py

# Once the main script completes, terminate the Celery worker
kill -TERM $CELERY_PID
# Wait for up to 30 seconds for Celery to gracefully shut down
for i in {1..30}; do
    if ps -p $CELERY_PID > /dev/null; then
        sleep 1
    else
        break
    fi
done

# If Celery hasn't shut down after 30 seconds, forcefully terminate it
if ps -p $CELERY_PID > /dev/null; then
    echo "Celery worker did not shut down gracefully; terminating forcefully."
    kill -9 $CELERY_PID
fi