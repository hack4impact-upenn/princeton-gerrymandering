from flask import Blueprint, request, Response, jsonify
from marshmallow import Schema, fields
from fields import name_field, email_field, password_field, name_validate
from werkzeug.security import check_password_hash, generate_password_hash
import flask_jwt_extended as jwt
from operator import itemgetter
import boto3
from botocore.exceptions import ClientError
import json

auth = Blueprint('auth', __name__,)


with open('./config/config.json') as f:
    config = json.load(f)

session = boto3.Session(
    aws_access_key_id=config['S3_ACCESS_KEY'],
    aws_secret_access_key=config['S3_SECRET_KEY'],
)
s3 = session.resource('s3')

@auth.route("/register", methods=['POST', 'GET'])
def register():
    """Register a new user, and send them a confirmation email."""
    class RegisterSchema(Schema):
        email = email_field
        password = password_field
    try:
        if not config["ALLOW_ACCOUNT_REGISTRATION"]:
            raise ValueError("Registration not open.")

        data = validate_request(request, RegisterSchema)
        email, password = itemgetter('email', 'password')(data)

        
        user_exists = False
        try:
            user_file = s3.Object(config['S3_BUCKET'], 'users/%s' % email).get()
            user_exists = True
        except ClientError:
            user_exists = False

        if user_exists:
            raise ValueError("User aleady exists.")
        
        user = { 
            "email": email,
            "password_hash": generate_password_hash(password) 
        }

        user_object = s3.Object(config['S3_BUCKET'], 'users/%s' % email)
        user_object.put(
            Body=(bytes(json.dumps(user).encode('UTF-8')))
        )
            
        resp = authenticate(user)
        return resp, 200
    except ValueError as e:
        return Response(str(e), 400)


@auth.route('/login', methods=['POST'])
def login():
    """Log in an existing user."""
    class LoginSchema(Schema):
        email = email_field
        password = password_field

    try:
        data = validate_request(request, LoginSchema)
        email, password = itemgetter('email', 'password')(data)

        try:
            user_file = s3.Object(config['S3_BUCKET'], 'users/%s' % email).get()
        except ClientError as e:
            raise ValueError("No matching user for email.")
        
        user = json.loads(user_file['Body'].read().decode('utf-8'))
        print(user.keys())
        
        if user["password_hash"] is None:
            raise ValueError("Password not set. Please check for email invite.")
        elif not check_password_hash(user["password_hash"], password):
            raise ValueError("Incorrect password.")
        else:
            resp = authenticate(user)
            return resp, 200

    except ValueError as e: 
        print(e)
        return Response(str(e), 400)


@auth.route('/refresh-access-token', methods=['POST'])
@jwt.jwt_refresh_token_required
def refresh_access_token():
    user = get_current_user()
    if user:
        access_token = jwt.create_access_token(identity=user["email"])
        resp = jsonify({})
        jwt.set_access_cookies(resp, access_token)
        return resp, 200
    abort(404)


def authenticate_payload(user):
    data = {
        'email': user["email"],
    }
    return jsonify(to_camel_case(data))


def authenticate(user):
    access_token = jwt.create_access_token(identity=user["email"])
    refresh_token = jwt.create_refresh_token(identity=user["email"])
    resp = authenticate_payload(user)
    jwt.set_access_cookies(resp, access_token)
    jwt.set_refresh_cookies(resp, refresh_token)
    return resp


def get_current_user():
    user_email = jwt.get_jwt_identity()
    try:
        user_file = s3.Object(config['S3_BUCKET'], 'users/%s' % email).get()
    except botocore.errorfactory.NoSuchKey as e:
        raise ValueError("No such user")
    user = json.loads(user_file['Body'].read().decode('utf-8'))
    return user
    

def validate_request(request, schema):
    if not request.data:
        raise ValueError("Invalid request")
    else:
        data = json.loads(request.data)
        validation_errors = schema().validate(data)
        if validation_errors:
            raise ValueError(str(validation_errors))
        return data

def to_camel_case(obj):
    if type(obj) == str:
        split = obj.split('_')
        return split[0] + ''.join(tok.title() for tok in split[1:])
    elif type(obj) == list:
        return [to_camel_case(o) for o in obj]
    elif type(obj) == dict:
        return {to_camel_case(k): (to_camel_case(v) if type(v) == dict else v)
                for (k, v) in obj.items()}
    else:
        return obj