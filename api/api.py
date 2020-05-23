
from flask import Blueprint, request
from elasticsearch import Elasticsearch
import certifi
import json
import random

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


@api.route("/graph_neighbors", methods=["POST"])
def graph_neighbors():
    req = request.get_json()
    query = req.get('query')
    # Randomly select root if none provided
    if query == None:
        query = str(random.random())

    neighbors = [{"id": query, "depth": 0}]
    links = []

    def expand_neighbors(neighbors, links, last_layer, i):
        new_neighbors = []
        for neighbor in last_layer:
            relevant = [str(random.random()) for i in range(5)]
            for r in relevant:
                if r not in [n["id"] for n in neighbors] and r not in [n["id"] for n in new_neighbors]:
                    links.append({"source": neighbor["id"], "target": r, "length": 1.0/(i+1)})
                    new_neighbors.append({"id": r, "depth": sum([1.0/(k+1) for k in range(i)]) })
        neighbors += new_neighbors
        return new_neighbors

    ITERATIONS = 2

    global new_neighbors    
    new_neighbors = neighbors
    for i in range(ITERATIONS):
        new_neighbors = expand_neighbors(neighbors, links, new_neighbors, i)
        
    return {
        "nodes": neighbors,
        "links": links,
        "root": query
    }


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
