#!/bin/bash
echo "Starting to trigger gunicorn"
gunicorn --bind  0.0.0.0:5000 main:app
