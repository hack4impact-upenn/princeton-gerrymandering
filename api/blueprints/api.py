import math
from flask import Blueprint, request, jsonify
import certifi
import os
import json
import random

from .auth import configure_jwt, admin_required
from requests_aws4auth import AWS4Auth
from elasticsearch import Elasticsearch, RequestsHttpConnection
import boto3
import boto3.session


from util.elasticsearch_queries import (
    or_contains_filter, or_not_contains_filter,
    and_filter, search_query,
    add_tags_query, remove_tags_query
)

from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    jwt_refresh_token_required, create_refresh_token,
    get_jwt_identity, set_access_cookies,
    set_refresh_cookies, unset_jwt_cookies
)

with open(os.path.join(os.path.dirname(__file__), "..", "config", "config.json")) as f:
    config = json.load(f)

    awsauth = AWS4Auth(
        config.get("AWS_ACCESS_KEY"),
        config.get("AWS_SECRET_KEY"),
        config.get("ELASTICSEARCH_REGION"),
        'es'
    )

    es = Elasticsearch(
        hosts=[{'host': config.get("ELASTICSEARCH_URL"), 'port': 443}],
        http_auth=awsauth,
        use_ssl=True,
        timeout=30,
        verify_certs=True,
        connection_class=RequestsHttpConnection
    )

    session = boto3.Session(
        aws_access_key_id=config.get("AWS_ACCESS_KEY"),
        aws_secret_access_key=config.get("AWS_SECRET_KEY"),
        region_name=config.get("S3_REGION")
    )
    s3_client = session.client(
        's3', config=boto3.session.Config(signature_version='s3v4'))


def configure_api(app):
    api = Blueprint('api', __name__)

    @api.route("/search", methods=["POST"])
    @jwt_required
    def search_documents():
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

        query = search_query(req, and_filters, and_not_filters, or_filters)
        res = es.search(index=config.get("ELASTICSEARCH_INDEX"), body=query)
        return res

    @api.route("/resource/<string:id>", methods=["GET"])
    @jwt_required
    def resource(id):
        query = {
            "query": {
                "match": {
                    "_id": id
                }
            }
        }
        res = es.search(index=config.get("ELASTICSEARCH_INDEX"), body=query)
        return res

    @api.route("/resource/link/<string:id>")
    @jwt_required
    def get_link(id):
        query = {
            "query": {
                "match": {
                    "_id": id
                }
            }
        }
        res = es.search(index=config.get("ELASTICSEARCH_INDEX"), body=query)
        path = res["hits"]["hits"][0]["_source"]["path"]

        link = s3_client.generate_presigned_url('get_object', Params={
            'Bucket': config.get("AWS_FILE_BUCKET"),
            'Key': path
        },  ExpiresIn=10)

        return {
            "url": link
        }

    @api.route("/suggest/<string:id>", methods=["GET"])
    @jwt_required
    def suggest(id):
        recs_results = []
        recomendations = ["yLgaL3MB0Xqz4htPkZFX", "-HJ-fnMBfx90TkXxN87_", "T3K2dHMBfx90TkXx78nu",
                          "Rrh6MHMB0Xqz4htPypUV", "gLjtLnMB0Xqz4htPsJCP", "AnKifnMBfx90TkXx-c-k", "LLg5NnMB0Xqz4htPj7Ds"]
        for rec in recomendations:
            recData = resource(rec)
            if(recData):
                recs_results.append(json.dumps(recData))
        return jsonify({'recs': recs_results}), 200

    @api.route("/tags/add", methods=["POST"])
    @jwt_required
    def add_tags():
        req = request.get_json()

        tag_type = req.get("tagType")
        tag_value = req.get("tagValue")
        resource_id = req.get("resourceId")

        if tag_type not in ["locations", "people", "orgs", "other"] or tag_value is "":
            return jsonify({
                "msg": "Please fill out all fields"
            }), 400

        res = es.update(index=config.get("ELASTICSEARCH_INDEX"), id=resource_id,
                        body=add_tags_query(tag_type, tag_value), refresh=True)

        return jsonify({
            "added": True
        }), 200

    @api.route("/tags/remove", methods=["POST"])
    @admin_required
    def remove_tags():
        req = request.get_json()

        tag_type = req.get("tagType")
        tag_value = req.get("tagValue")
        resource_id = req.get("resourceId")

        if tag_type not in ["locations", "people", "orgs", "other"] or tag_value is "":
            return jsonify({
                "msg": "Unknown error"
            }), 400

        res = es.update(index=config.get("ELASTICSEARCH_INDEX"), id=resource_id,
                        body=remove_tags_query(tag_type, tag_value), refresh=True)
        return jsonify({
            "removed": True
        }), 200

    @api.route("/tags/suggestions", methods=["POST"])
    @jwt_required
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

        res = es.search(index=config.get("ELASTICSEARCH_INDEX"), body=query)
        buckets = res["aggregations"]["suggested_tags"]["buckets"]
        all_tags = [bucket["key"] for bucket in buckets]
        tags = list(filter(lambda tag: tag.lower().startswith(
            req["query"].lower()), all_tags))[0:25]
        return {
            "tags": tags
        }

    # This MUST be the last line in the configuration function
    app.register_blueprint(api, url_prefix="/api")
