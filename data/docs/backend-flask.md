# Flask

## Overview

Flask is a lightweight WSGI web application framework in Python. It is designed to make getting started quick and easy, with the ability to scale up to complex applications. Flask is classified as a microframework because it does not require particular tools or libraries.

## Core Philosophy

### Microframework

Flask keeps the core simple but extensible. It doesn't enforce a specific structure or require dependencies beyond the core.

### Flexibility

Flask allows developers to choose their own tools and libraries for database integration, authentication, and other functionality.

## Basic Application

```python
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello, Flask!'

@app.route('/users', methods=['GET'])
def get_users():
    return jsonify({'users': ['Alice', 'Bob']})

@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    return jsonify({'user': data}), 201

if __name__ == '__main__':
    app.run(debug=True)
```

## Routing

### Dynamic Routes

```python
@app.route('/users/<username>')
def show_user(username):
    return f'User: {username}'

@app.route('/post/<int:post_id>')
def show_post(post_id):
    return f'Post #{post_id}'

@app.route('/path/<path:subpath>')
def show_subpath(subpath):
    return f'Subpath: {subpath}'
```

### URL Building

```python
from flask import url_for

@app.route('/')
def index():
    return url_for('show_user', username='john')  # /users/john
```

### HTTP Methods

```python
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return do_login()
    else:
        return show_login_form()
```

## Request Handling

### Request Object

```python
from flask import request

@app.route('/upload', methods=['POST'])
def upload():
    # Form data
    username = request.form.get('username')

    # Query parameters
    page = request.args.get('page', 1, type=int)

    # JSON data
    data = request.get_json()

    # Files
    file = request.files['file']

    # Headers
    auth = request.headers.get('Authorization')

    return jsonify({'success': True})
```

## Responses

### JSON Responses

```python
from flask import jsonify

@app.route('/api/users')
def users():
    return jsonify({
        'users': [
            {'id': 1, 'name': 'Alice'},
            {'id': 2, 'name': 'Bob'}
        ]
    })
```

### Custom Responses

```python
from flask import make_response

@app.route('/custom')
def custom_response():
    response = make_response(jsonify({'data': 'value'}), 201)
    response.headers['X-Custom-Header'] = 'value'
    return response
```

## Templates (Jinja2)

### Basic Templates

```python
from flask import render_template

@app.route('/hello/<name>')
def hello(name):
    return render_template('hello.html', name=name)
```

```html
<!-- templates/hello.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>Hello</title>
  </head>
  <body>
    <h1>Hello, {{ name }}!</h1>

    {% if users %}
    <ul>
      {% for user in users %}
      <li>{{ user.name }} ({{ user.email }})</li>
      {% endfor %}
    </ul>
    {% else %}
    <p>No users found.</p>
    {% endif %}
  </body>
</html>
```

### Template Filters

```html
{{ name|upper }} {{ description|truncate(100) }} {{ date|datetimeformat('%Y-%m-%d') }}
```

## Sessions

```python
from flask import session

app.secret_key = 'your-secret-key'

@app.route('/login', methods=['POST'])
def login():
    session['username'] = request.form['username']
    return redirect(url_for('index'))

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))
```

## Error Handling

```python
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('500.html'), 500
```

## Blueprints

Organize applications into components:

```python
from flask import Blueprint

users_bp = Blueprint('users', __name__, url_prefix='/users')

@users_bp.route('/')
def list_users():
    return 'List of users'

@users_bp.route('/<id>')
def get_user(id):
    return f'User {id}'

# Register blueprint
app.register_blueprint(users_bp)
```

## Configuration

```python
app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'secret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'

# From environment
app.config.from_envvar('APP_SETTINGS')

# From object
app.config.from_object('config.ProductionConfig')
```

## Extensions

### Flask-SQLAlchemy

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

# Usage
@app.route('/users')
def users():
    users = User.query.all()
    return jsonify([{'id': u.id, 'username': u.username} for u in users])
```

### Flask-Login

```python
from flask_login import LoginManager, login_required, current_user

login_manager = LoginManager(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/protected')
@login_required
def protected():
    return f'Hello, {current_user.username}!'
```

### Flask-WTF (Forms)

```python
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        # Process login
        return redirect(url_for('index'))
    return render_template('login.html', form=form)
```

### Flask-Migrate

```python
from flask_migrate import Migrate

migrate = Migrate(app, db)
```

Commands:

- `flask db init` - Initialize migrations
- `flask db migrate` - Create migration
- `flask db upgrade` - Apply migrations

### Flask-CORS

```python
from flask_cors import CORS

CORS(app, resources={r"/api/*": {"origins": "*"}})
```

## REST API with Flask-RESTful

```python
from flask_restful import Api, Resource

api = Api(app)

class UserResource(Resource):
    def get(self, user_id):
        return {'user': user_id}

    def put(self, user_id):
        data = request.get_json()
        return {'user': user_id, 'updated': data}

    def delete(self, user_id):
        return {'message': 'User deleted'}

class UserListResource(Resource):
    def get(self):
        return {'users': []}

    def post(self):
        data = request.get_json()
        return {'user': data}, 201

api.add_resource(UserListResource, '/api/users')
api.add_resource(UserResource, '/api/users/<user_id>')
```

## Testing

```python
import pytest

def test_home(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'Hello' in response.data

def test_api_users(client):
    response = client.get('/api/users')
    assert response.status_code == 200
    assert 'users' in response.get_json()
```

## CLI Commands

```python
import click

@app.cli.command()
def init_db():
    """Initialize the database."""
    db.create_all()
    click.echo('Database initialized.')
```

Run with:

```bash
flask init-db
```

## Deployment Options

- Gunicorn (production WSGI server)
- uWSGI
- Waitress
- Gevent
- Docker containers
- AWS, Heroku, Google Cloud, Azure

## Security Best Practices

- Use Flask-Talisman for security headers
- Flask-SeaSurf for CSRF protection
- Flask-Limiter for rate limiting
- Always validate user input
- Use parameterized queries
- Keep SECRET_KEY secret
- Use HTTPS in production
