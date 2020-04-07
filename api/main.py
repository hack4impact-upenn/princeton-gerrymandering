from flask import Flask
from flask_cors import CORS
from api import api
import os

app = Flask(__name__, static_folder='../client/dist', static_url_path='/static/')
CORS(app)
app.register_blueprint(api, url_prefix = "/api")

@app.route('/', defaults={'upath': ''})
@app.route('/<path:upath>')
def index(upath):
    return app.send_static_file('index.html')


app.run(
    debug=os.environ.get("FLASK_ENV") == "development"
)
