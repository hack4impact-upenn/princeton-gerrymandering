import functools
import json
import os
from flask import request, Blueprint, jsonify, redirect

from .auth import admin_required, configure_jwt
from util.user import is_admin, validate_user, get_users, create_user, delete_user, update_password, create_default_admin
from jwt import ExpiredSignatureError

from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    jwt_refresh_token_required, create_refresh_token,
    get_jwt_identity, set_access_cookies,
    set_refresh_cookies, unset_jwt_cookies
)

with open(os.path.join(os.path.dirname(__file__), "..", "config", "config.json")) as f:
    config = json.load(f)


def configure_users(app):   
    users = Blueprint("users", __name__)
    
    create_default_admin()

    @users.route("/all", methods = ["GET"])
    @admin_required
    def get_all_users():
        return {
            "users": get_users()
        }


    @users.route("/add", methods = ["POST"])
    @admin_required
    def add_user():
        req = request.get_json()
        username = req.get('username')
        password = req.get('password')

        try:
            create_user(username, password)
        except ValueError as e:
            return jsonify({
                "message": str(e)
            }), 500
        
        return jsonify({
            "message": "success"
        }), 200


    @users.route("/delete", methods = ["DELETE"])
    @jwt_required
    @admin_required
    def delete_user_route():
        req = request.get_json()
        username = req.get('username')

        print(username)

        try: 
            delete_user(username)

        except ValueError as e:
            return jsonify({
                "message": str(e)
            }), 500
        
        return jsonify({
            "message": "success"
        }), 200


    @users.route("/change_password", methods = {"POST"})
    @jwt_required
    @admin_required
    def change_password_route():
        req = request.get_json()
        username = req.get('username')
        new_password = req.get('newPassword')

        update_password(username, new_password)

        return jsonify({
            "message": "success"
        }), 200

    # This MUST be the last line in the configuration function
    app.register_blueprint(users, url_prefix = "/user")

