from flask import Blueprint

api = Blueprint('api', __name__,)

@api.route("/search", methods = ["GET", "POST"])
def api_index():
    return {'testing': "hello"}
