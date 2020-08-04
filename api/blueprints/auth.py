import functools
import json
import os
from flask import request, Blueprint, jsonify, redirect
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    jwt_refresh_token_required, create_refresh_token,
    get_jwt_identity, set_access_cookies,
    set_refresh_cookies, unset_jwt_cookies, decode_token,
)
from flask_jwt_extended import (
    JWTManager
)
from util.user import is_admin, validate_user, user_exists

with open(os.path.join(os.path.dirname(__file__), "..", "config", "config.json")) as f:
    config = json.load(f)

auth = Blueprint("auth", __name__)

def configure_jwt(app):
    jwt = JWTManager(app)

    @jwt.invalid_token_loader
    @jwt.unauthorized_loader
    def unauthorized(msg):
        return redirect("/unauthorized"), 302


def configure_auth(app):
    auth = Blueprint('auth', __name__)

    @auth.route("/login", methods = ["POST"])
    def login():
        username = request.json.get('username', None)
        password = request.json.get('password', None)

        if not validate_user(username, password):
            return jsonify({'login': False}), 401

        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)

        # Set the JWTs and the CSRF double submit protection cookies
        # in this response
        resp = jsonify({'login': True})
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)
        return resp, 200


    @auth.route('/token/refresh', methods=['POST'])
    @jwt_refresh_token_required
    def refresh():
        # Create the new access token
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user)

        if not user_exists(current_user):
            return jsonify({
                "msg": "Unauthorized"
            })

        # Set the access JWT and CSRF double submit protection cookies
        # in this response
        resp = jsonify({'refresh': True})
        set_access_cookies(resp, access_token)
        return resp, 200

    
    @auth.route('/logout', methods=['GET'])
    def logout():
        resp = redirect('/login')
        unset_jwt_cookies(resp)
        return resp   

    
    @auth.route("/authenticated", methods=["GET"])
    @jwt_required
    def is_authenticated():
        username = get_jwt_identity()
        return jsonify({
            "admin": is_admin(username)
        })


    # This MUST be the last line in the configuration function
    app.register_blueprint(auth, url_prefix = "/auth")


# Requires admin account and non-expired access token
def admin_required(route):
    @functools.wraps(route)
    @jwt_required
    def wrapper(*args, **kwds):
        try:
            username = get_jwt_identity()
            if(is_admin(username)):
                return route(*args, **kwds)
            else:
                raise ValueError("Not Authorized")
        except Exception as e:
            print(str(e))
            return jsonify({
                "msg": "Unauthorized"
            }), 401
    return wrapper


# Only requires refresh token associated with admin account
def admin_required_frontend(route):
    @functools.wraps(route)
    @jwt_refresh_token_required
    def wrapper(*args, **kwds):
        try:
            username = get_jwt_identity()
            if(is_admin(username)):
                return route(*args, **kwds)
            else:
                return redirect("/unauthorized"), 302
        except Exception as e:
            print(str(e))
            return jsonify({
                "msg": "Unauthorized"
            }), 401
    return wrapper

# Decorator to protect routes to only unauthenticated users, primarily for login page
def not_logged_in_required(route):
    @functools.wraps(route)
    def wrapper(*args, **kwds):
        try:
            token = decode_token(
                request.cookies.get('access_token_cookie'), 
                request.cookies.get('csrf_access_token'),
                allow_expired=True
            )
            if token.get('identity'):
                return redirect("/"), 302

        except Exception as e:
            return route(*args, **kwds)

        return route(*args, **kwds)
    return wrapper