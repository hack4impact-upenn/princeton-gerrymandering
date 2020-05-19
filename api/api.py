
from flask import Blueprint, request
from elasticsearch import Elasticsearch
import certifi
import json

with open('./config/config.json') as f:
    config = json.load(f)

api = Blueprint('api', __name__,)
es = Elasticsearch([config["ELASTICSEARCH_URL"]],
                   use_ssl=True, ca_certs=certifi.where())


@api.route("/search", methods=["GET", "POST"])
def api_index():
    req = request.get_json()
    and_filters = []
    and_not_filters = []
    or_filters = []

    for filter in req['filters']:
        if req['isOr']:
            if filter['filter'] == "contains":
                or_filters.append(or_contains_filter(filter))
            elif filter['filter'] == "contains_not":
                or_filters.append(or_not_contains_filter(filter))
            else:
                print("Unsupported filter type %s" % filter['filter'])

        if not req['isOr']:
            if filter['filter'] == "contains":
                and_filters.append(and_filter(filter))
            elif filter['filter'] == "contains_not":
                and_not_filters.append(and_filter(filter))
            else:
                print("Unsupported filter type %s" % filter['filter'])

    query = generate_query(req, and_filters, and_not_filters, or_filters)
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


@api.route("/suggested_tags", methods=["POST"])
def suggested_tags():
    req = request.get_json()
    query = {
        "query": {
            "prefix": {
                "tags.%s" % req["type"]: {
                    "value": req["query"].lower()
                }
            }
        },
        "aggs": {
            "suggested_tags": {
                "terms": {
                    "field": "tags.%s.keyword" % req["type"],
                    "size": 1000
                }
            }
        },
        "size": 0
    }

    print(query)

    res = es.search(index="pgp", body=query)
    buckets = res["aggregations"]["suggested_tags"]["buckets"]
    all_tags = [bucket["key"] for bucket in buckets]
    tags = list(filter( lambda tag : tag.lower().startswith(req["query"].lower()), all_tags))[0:25]
    return {
        "tags": tags
    }

def or_contains_filter(filter):
    return {
        "bool": {
            "must": {
                "term": {
                    "tags.%s.keyword" % filter['attribute']: filter['value']
                }
            }
        }
    }


def or_not_contains_filter(filter):
    return {
        "bool": {
            "must_not": {
                "term": {
                    "tags.%s.keyword" % filter['attribute']: filter['value']
                }
            }
        }
    }


def and_filter(filter):
    return {
        "term": {
            "tags.%s.keyword" % filter['attribute']: filter['value']
        }
    }


def generate_query(req, and_filters, and_not_filters, or_filters):
    return {
        "query": {
            "bool": {
                "must": {"simple_query_string": {
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