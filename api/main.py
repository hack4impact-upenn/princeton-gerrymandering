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

from blueprints.auth import authentication_required

app = Flask(__name__, static_folder='../client/dist', static_url_path='/static/')
with open('./api/config/config.json') as f:
    config = json.load(f)
    app.config.update(config)
CORS(app)

jwt = JWTManager(app)

from blueprints.api import api as api_blueprint
app.register_blueprint(api_blueprint, url_prefix = "/api")

from blueprints.auth import auth as auth_blueprint
app.register_blueprint(auth_blueprint, url_prefix = "/auth")


@app.route("/login")
@app.route("/unauthorized")
def open_pages():
    return app.send_static_file('index.html')

@app.route('/', defaults={'upath': ''})
@app.route('/<path:upath>')
@authentication_required
def index(upath):
    return app.send_static_file('index.html')

app.run(
    debug=os.environ.get("FLASK_ENV") == "development"
)
