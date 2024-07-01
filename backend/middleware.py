from flask import request, jsonify, g
from functools import wraps
from firebase_admin import auth


# Middleware function to verify Firebase ID token
def firebase_token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = request.headers.get('Authorization')

        if not id_token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token['uid']
            # You can fetch additional user information if needed
            user = auth.get_user(uid)

            # Store user information in Flask's global 'g' object if necessary
            g.user = user

            return f(*args, **kwargs)

        # except auth.AuthError as e:
        #     return jsonify({'message': 'Token verification failed', 'error': str(e)}), 401

        except Exception as e:
            return jsonify({'message': 'Token verification failed', 'error': str(e)}), 401

    return decorated_function