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


def search_query(req, and_filters, and_not_filters, or_filters):
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

def add_tags_query(tag_type, tag_value):
    return {
        "script" : {
            "inline": "ctx._source.tags.%s.add(params.new_tag)" % (tag_type),
            "lang": "painless",
            "params" : {
                "new_tag" : tag_value
            }
        }
    }

def remove_tags_query(tag_type, tag_value):
     return {
        "script" : {
            "inline": "ctx._source.tags.%s.removeAll(Collections.singleton(params.tag_value))" % (tag_type),
            "lang": "painless",
            "params" : {
                "tag_value" : tag_value
            }
        }
    }