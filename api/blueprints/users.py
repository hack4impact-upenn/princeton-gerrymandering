import functools
import json
import os
from flask import request, Blueprint, jsonify, redirect

from .auth import admin_required
from util.user import is_admin, validate_user, get_users, create_user, delete_user, update_password
from jwt import ExpiredSignatureError

with open(os.path.join(os.path.dirname(__file__), "..", "config", "config.json")) as f:
    config = json.load(f)

users = Blueprint("users", __name__)


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
@admin_required
def change_password_route():
    req = request.get_json()
    username = req.get('username')
    new_password = req.get('newPassword')

    update_password(username, new_password)

    return jsonify({
        "message": "success"
    }), 200

