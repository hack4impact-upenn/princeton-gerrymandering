# Princeton Gerrymandering Project
## Getting Started
1. To start off, go to the `api` folder with `cd api` and run `python3 -m venv venv`, which creates a virtual environment. 
2. Activate the virtual environment by running `. ./venv/bin/activate`
3. Install python dependencies by running `pip3 install -r requirements.txt`
4. Go back to the root directory by running `cd ..`, and install JavaScript dependencies with `npm install`

## Configuration

Before running the application, you'll need to set configuration variables in the `api/config/config.json`

| Variable                 | Description                                                                                                                                                            |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ELASTICSEARCH_URL        | The URL for the ElasticSearch instance hosting the processed JSON documents, this URL should not contain `http://` or `https://`, just the domain URL itself                                                                                            |
| ELASTICSEARCH_INDEX      | The main index the where the processed JSON documents are stored                                                                                                       |
| ELASTICSEARCH_REGION      | The region in which the ElasticSearch server is running                                                                                                       |
| JWT_TOKEN_LOCATION       | Where to look for a JWT when processing a request. See [JWT docs](https://flask-jwt-extended.readthedocs.io/en/stable/options/) for more information                   |
| JWT_COOKIE_SECURE        | If the secure flag should be set on your JWT cookies. See [JWT docs](https://flask-jwt-extended.readthedocs.io/en/stable/options/) for more information                |
| JWT_COOKIE_CSRF_PROTECT  | Enable/disable CSRF protection when using cookies. See [JWT docs](https://flask-jwt-extended.readthedocs.io/en/stable/options/) for more information                   |
| JWT_SECRET_KEY           | The secret key needed for symmetric based signing algorithms. See [JWT docs](https://flask-jwt-extended.readthedocs.io/en/stable/options/) for more information        |
| JWT_ACCESS_TOKEN_EXPIRES | How long an access token should live before it expires (in seconds). See [JWT docs](https://flask-jwt-extended.readthedocs.io/en/stable/options/) for more information |
| AWS_ACCESS_KEY | The AWS access key for the entire application |
| AWS_SECRET_KEY | The AWS secret key for the entire application |
| AWS_USER_BUCKET | The name of the bucket the application should use to store user information |
| DEFAULT_ADMIN_USER | The username for the default admin account created when the app starts and no admin account already exists |
| DEFAULT_ADMIN_PASS | The password for the default admin account created when the app starts and no admin account already exists  |

## Running the Application
### Development
 The application comes with webpack-dev-server, which makes it easier to test the UI. When using webpack-dev-server for the front-end, requests to the RESTFUL `/auth` and `/api` endpoints need to be proxied, as such requests can only be handled by the Flask server. Thankfully, webpack-dev-server takes care of this. If you choose to run the Flask application on a different port, be sure to change the proxy port for dev-server in [/config/webpack.config.js](/config/webpack.config.js)

 While this works great for testing, not all of the authentication features can be fully used when the application is being served from webpack-dev-server, because front-end endpoints cannot be protected. Sensitive backend requests will still require login, but no redirects will be made when a user accesses a page they shouldn't.

 1. Open two seperate terminal tabs
 2. Run `npm run api` in one tab, which will start the Flask backend
 3. Run `npm run dev-server` in the other tab, which will start webpack-dev-server. It will take around a minute to compile on the first request, but this is to be expected. 

 ### Production

Instead of using webpack-dev-server in production, we precompile the frontend using webpack. 

 1. Run `npm run build`. Wait for this to finish running and confirm that the frontend has compiled
 2. Run `npm run api`, which will handle both serving the frontend and backend API and authentication requests