from flask import Blueprint, request
from elasticsearch import Elasticsearch


api = Blueprint('api', __name__,)
es = Elasticsearch(['https://search-princeton-gerrymandering-tdoxp3nyeow6asnjm3rufdjf7y.us-east-1.es.amazonaws.com/'])


@api.route("/search", methods = ["GET", "POST"])
def api_index():
    query = {
        "query": {
            "bool": {
                "must": [
                    {
                        "simple_query_string": {
                            "query": request.get_json()['query']
                        }
                    }
                ]
            }
        }
    }
    res = es.search(index="pgp", body=query)
    return res
