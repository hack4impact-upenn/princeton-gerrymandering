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

app = Flask(__name__, static_folder='../client/dist', static_url_path='/static/')
with open('./api/config/config.json') as f:
    config = json.load(f)
    app.config.update(config)
CORS(app)

jwt = JWTManager(app)

@app.route('/login', methods=["POST", "GET"])
def login():
    if request.method == "GET":
        if get_jwt_identity() == None:
            return app.send_static_file('index.html')
        return redirect("/")
    else:
        username = request.json.get('username', None)
        password = request.json.get('password', None)

        if username != 'test' or password != 'test':
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


@app.route('/token/refresh', methods=['POST'])
@jwt_refresh_token_required
def refresh():
    print("Hey")
    # Create the new access token
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)

    # Set the access JWT and CSRF double submit protection cookies
    # in this response
    resp = jsonify({'refresh': True})
    set_access_cookies(resp, access_token)
    return resp, 200


@app.route('/logout', methods=['GET'])
def logout():
    resp = redirect('/login')
    unset_jwt_cookies(resp)
    return resp

@jwt.unauthorized_loader
def redirect_unauthorized(expired_token):
    return redirect("/unauthorized")

@app.route("/unauthorized")
def unauthorized():
    return app.send_static_file('index.html')

from blueprints.api import api as api_blueprint
app.register_blueprint(api_blueprint, url_prefix = "/api")

@app.route('/', defaults={'upath': ''})
@app.route('/<path:upath>')
@jwt_required
def index(upath):
    return app.send_static_file('index.html')

app.run(
    debug=os.environ.get("FLASK_ENV") == "development"
)
