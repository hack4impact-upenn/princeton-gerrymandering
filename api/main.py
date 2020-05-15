from flask import Flask
from flask_cors import CORS
from api import api
from auth import auth
import os
from flask_jwt_extended import JWTManager
import json

app = Flask(__name__, static_folder='../client/dist', static_url_path='/static/')
with open('./config/config.json') as f:
    app.config.update(json.load(f))

CORS(app)
JWTManager(app)

app.register_blueprint(api, url_prefix = "/api")
app.register_blueprint(auth, url_prefix= "/auth")

@app.route('/', defaults={'upath': ''})
@app.route('/<path:upath>')
def index(upath):
    return app.send_static_file('index.html')


app.run(
    debug=os.environ.get("FLASK_ENV") == "development"
)
