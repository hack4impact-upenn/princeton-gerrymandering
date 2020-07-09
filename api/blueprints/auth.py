import functools
import json
from flask import request, Blueprint, jsonify, redirect
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    jwt_refresh_token_required, create_refresh_token,
    get_jwt_identity, set_access_cookies,
    set_refresh_cookies, unset_jwt_cookies, decode_token
)

from util.user import is_admin, validate_user
from jwt import ExpiredSignatureError

with open('./api/config/config.json') as f:
    config = json.load(f)

auth = Blueprint("auth", __name__)


# Decorator to protect routes to only logged in users
def login_required(route):
    @functools.wraps(route)
    def wrapper(*args, **kwds):
        try:
            token = decode_token(
                request.cookies.get('access_token_cookie'), 
                request.cookies.get('csrf_access_token')
            )
            if token.get('identity') == None:
                print("rediretc")
                return redirect("/unauthorized"), 300

        except ExpiredSignatureError as e:
            return jsonify({
                "msg": "Token has expired"
            }), 401

        except Exception as e:
            return redirect("/unauthorized"), 302

        return route(*args, **kwds)
    return wrapper


# Decorator to protect routes for only administrators
def admin_required(route):
    @functools.wraps(route)
    def wrapper(*args, **kwds):
        try: 
            token = decode_token(
                request.cookies.get('access_token_cookie'), 
                request.cookies.get('csrf_access_token'),
                allow_expired=True
            )
            current_user = token.get("identity")
            if is_admin(current_user):
                return route(*args, **kwds)
            else:
                return redirect("/unauthorized"), 302
        except Exception as e:
            print(str(e)) 
            return redirect("/unauthorized"), 302
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

# Returns true if user logged in at some point, doesn't need current access token
def authentication_required(route):
    @functools.wraps(route)
    def wrapper(*args, **kwds):
        try:
            token = decode_token(
                request.cookies.get('access_token_cookie'), 
                request.cookies.get('csrf_access_token')
            )
            if token.get('identity') == None:
                print("rediretc")
                return redirect("/unauthorized"), 302

        except ExpiredSignatureError as e:
            pass

        except Exception as e:
            return redirect("/unauthorized"), 302

        return route(*args, **kwds)
    return wrapper


@not_logged_in_required
@auth.route("/login", methods = ["POST"])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)

    if not validate_user(username, password):
        return jsonify({'login': False}), 401

    # Create the tokens we will be sending back to the user
    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)

    # Set the JWTs and the CSRF double submit protection cookies
    # in this response
    resp = jsonify({'login': True})
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    return resp, 200


@auth.route("/authenticated")
@login_required
def is_authenticated():
    try:
        token = decode_token(
            request.cookies.get('access_token_cookie'), 
            request.cookies.get('csrf_access_token')
        )
        current_user = token.get("identity")
        IS_ADMIN = is_admin(current_user)
    except Exception as e:
        IS_ADMIN = False

    return jsonify({
        "admin": IS_ADMIN
    }), 200


@auth.route('/token/refresh', methods=['POST'])
def refresh():
    try: 
        token = decode_token(
                request.cookies.get('access_token_cookie'), 
                request.cookies.get('csrf_access_token'),
                allow_expired=True
        )
        current_user = token.get("identity")
        access_token = create_access_token(identity=current_user)
        resp = jsonify({'refresh': True})
        set_access_cookies(resp, access_token)
        return resp, 200
    except Exception as e:
        return jsonify({
            "msg": e
        }), 500

    # Set the access JWT and CSRF double submit protection cookies
    # in this response

@auth.route('/logout', methods=['GET'])
def logout():
    resp = redirect('/login')
    unset_jwt_cookies(resp)
    return resp   

# @jwt.unauthorized_loader
# def redirect_unauthorized(expired_token):
#     return redirect("/unauthorized")

# @app.route("/unauthorized")
# def unauthorized():
#     return app.send_static_file('index.html')
