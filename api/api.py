from flask import Blueprint, request
from elasticsearch import Elasticsearch
import certifi


api = Blueprint('api', __name__,)
es = Elasticsearch(['https://search-princeton-gerrymandering-tdoxp3nyeow6asnjm3rufdjf7y.us-east-1.es.amazonaws.com/'], use_ssl=True, ca_certs=certifi.where())


@api.route("/search", methods = ["GET", "POST"])
def api_index():
    req = request.get_json()
    and_filters = []
    and_not_filters = []
    or_filters = []

    for filter in req['filters']:
        if req['isOr']:
            if filter['filter'] == "contains":
                print({field : filter['value']})
                new_filter = {
                    "bool": {
                        "must": {
                            "match": {
                                "tags.%s" % filter['attribute'] : filter['value']
                            }
                        }
                    }
                }
                or_filters.append(new_filter)
            elif filter['filter'] == "contains_not":
                new_filter = {
                    "bool": {
                        "must_not": {
                            "match": {
                                "tags.%s" % filter['attribute']: filter['value']
                            }
                        }
                    }
                }
                or_filters.append(new_filter)
            else:
                print("Unsupported filter type %s" % filter['filter'])


        if not req['isOr']:
            if filter['filter'] == "contains":
                new_filter = { "match": {
                    "tags.%s" % filter['attribute'] : filter['value']
                }}
                and_filters.append(new_filter)
            elif filter['filter'] == "contains_not":
                new_filter = { "match": {
                    "tags.%s" % filter['attribute'] : filter['value']
                }}
                and_not_filters.append(new_filter)
            else:
                print("Unsupported filter type %s" % filter['filter'])

    query = {
        "query": {
            "bool": {
                "must": { "simple_query_string": {
                    "query": req['query']
                }},
                "filter": and_filters,
                "must_not": and_not_filters,
                "should": or_filters,
                "minimum_should_match": 0 if len(or_filters) == 0 else 1
            },
        },
        "size": req['pageSize'],
        "from": req['pageSize'] * (req['page'] - 1)
    }
    print(query)
    res = es.search(index="pgp", body=query)
    return res


@api.route("/resource/<string:id>", methods=["GET"])
def resource(id):
    query = {
        "query": {
            "match": {
                "_id": id
            }
        }
    }
    res = es.search(index="pgp", body=query)
    return res
