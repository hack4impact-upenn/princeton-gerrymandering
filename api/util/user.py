import json
import os
import boto3
from botocore.exceptions import ClientError
from werkzeug.security import check_password_hash, generate_password_hash

with open(os.path.join(os.path.dirname(__file__), "..", "config", "config.json")) as f:
    config = json.load(f)

session = boto3.Session(
    aws_access_key_id=config['AWS_ACCESS_KEY'],
    aws_secret_access_key=config['AWS_SECRET_KEY'],
)
s3 = session.resource('s3')
bucket = s3.Bucket(config['AWS_USER_BUCKET'])


def validate_user(username, password):
    print(username, password)

    try:
        user_file = s3.Object(config['AWS_USER_BUCKET'], username).get()
    except ClientError as e:
        print(e)
        return False

    user = json.loads(user_file['Body'].read().decode('utf-8'))
    print(user)
    if user.get("password_hash") is None:
        return False
    else:
        return check_password_hash(user.get("password_hash"), password)


# Creates new user with given username and password, throws error if user exists already
def create_user(username, password, is_admin=False):
    user_exists = False
    try:
        user_file = s3.Object(config['AWS_USER_BUCKET'], username).get()
        user_exists = True
    except ClientError:
        user_exists = False

    if user_exists:
        raise ValueError("User %s already exists" % username)

    user = {
        "username": username, 
        "password_hash": generate_password_hash(password),
        "admin": is_admin
    }
    user_object = s3.Object(config['AWS_USER_BUCKET'], username)
    user_object.put(
        Body=(bytes(json.dumps(user).encode('UTF-8')))
    )


# Only from admin accounts
def change_password(username, new_password):
    return True


# Only from admin accounts
def delete_user(username):
    return True


# If no admin account exists when server starts, create default account
def create_default_admin():
    admin_exists = any([is_admin(obj.key) for obj in bucket.objects.all()])

    if not admin_exists:
        try: 
            create_user(config["DEFAULT_ADMIN_USER"], config["DEFAULT_ADMIN_PASS"], True) 
        except Exception as e:
            raise ValueError("Encountered issue while creating default admin account: %s" % str(e))


# Checks if user given by their username is an admin
def is_admin(username):
    return get_user(username)["admin"]


# Returns user object
def get_user(username):
    user_file = s3.Object(config['AWS_USER_BUCKET'], username).get()
    user = json.loads(user_file['Body'].read().decode('utf-8'))
    return user


# Returns all users
def get_users():
    return [ {
        "username": obj.key,
        "admin": is_admin(obj.key)
    } for obj in bucket.objects.all()]


def delete_user(username):
    if is_admin(username):
        raise ValueError("Cannot delete the admin account")
    s3.Object(config['AWS_USER_BUCKET'], username).delete()


def update_password(username, new_password):
    was_admin = is_admin(username)
    s3.Object(config['AWS_USER_BUCKET'], username).delete()
    create_user(username, new_password, was_admin)
