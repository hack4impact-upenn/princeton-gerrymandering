from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import os
import json

from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    jwt_refresh_token_required, create_refresh_token,
    get_jwt_identity, set_access_cookies,
    set_refresh_cookies, unset_jwt_cookies
)

from blueprints.auth import configure_jwt, admin_required, admin_required_frontend, not_logged_in_required
from util.user import create_default_admin

app = Flask(__name__, static_folder='../client/dist', static_url_path='/static/')
with open(os.path.join(os.path.dirname(__file__), "config", "config.json")) as f:
    config = json.load(f)
    app.config.update(config)
CORS(app)

jwt = configure_jwt(app)

from blueprints.api import configure_api
from blueprints.auth import configure_auth
from blueprints.users import configure_users

configure_api(app)
configure_auth(app)
configure_users(app)

@app.route("/login")
@not_logged_in_required
def not_logged_in_pages():
    return app.send_static_file('index.html')


# Front-end routes that are always accessible
@app.route("/unauthorized")
def open_pages():
    return app.send_static_file('index.html')


# Front-end routes only accessible to admins
@app.route("/users")
@admin_required_frontend
def admin_required_pages():
    return app.send_static_file('index.html')


# Front-end routes accessible to only logged in users, all remaining routes
@app.route('/', defaults={'upath': ''})
@app.route('/<path:upath>')
@jwt_refresh_token_required
def user_protected_pages(upath):
    return app.send_static_file('index.html')


if not config.get("PRODUCTION"):
    app.run(
        debug=os.environ.get("FLASK_ENV") == "development"
    )
