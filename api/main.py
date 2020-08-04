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

from blueprints.auth import authentication_required, admin_required, not_logged_in_required
from util.user import create_default_admin

app = Flask(__name__, static_folder='../client/dist', static_url_path='/static/')
with open(os.path.join(os.path.dirname(__file__), "config", "config.json")) as f:
    config = json.load(f)
    app.config.update(config)
CORS(app)

jwt = JWTManager(app)

from blueprints.api import api as api_blueprint
app.register_blueprint(api_blueprint, url_prefix = "/api")

from blueprints.auth import auth as auth_blueprint
app.register_blueprint(auth_blueprint, url_prefix = "/auth")

from blueprints.users import users as users_blueprint
app.register_blueprint(users_blueprint, url_prefix = "/user")

create_default_admin()

# Front-end routes only accessible when not logged in
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
@admin_required
def admin_required_pages():
    return app.send_static_file('index.html')


# Front-end routes accessible to only logged in users, all remaining routes
@app.route('/', defaults={'upath': ''})
@app.route('/<path:upath>')
@login_required
def user_protected_pages(upath):
    return app.send_static_file('index.html')


if not config.get("PRODUCTION"):
    app.run(
        debug=os.environ.get("FLASK_ENV") == "development"
    )
