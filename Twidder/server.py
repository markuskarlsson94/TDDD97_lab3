# coding=utf-8

from flask import Flask, request, jsonify, Response, send_from_directory
import database_helper
from random import randint

app = Flask(__name__)
#@app.route('/')
#def hello_world():
#    return 'Hello hjesna!'


@app.teardown_request
def after_request(exception):
    database_helper.close_db()

def create_response(status, message, data = 'N/A'):
    if data == 'N/A':
        return jsonify({'status' : status, 'message' : message})
    else:
        return jsonify({'status' : status, 'message' : message, 'data' : data})

@app.route('/')
@app.route('/client')
def client_page():
    return send_from_directory('static','client.html')


@app.route('/register', methods = ['POST'])
def sign_up():
    data = request.get_json()
    firstname = data['firstname']
    familyname = data['familyname']
    email = data['email']
    passw = data['password']
    gender = data['gender']
    city = data['city']
    country = data['country']

    if (len(firstname) == 0):
        response = create_response(False, 'Too short firstname')
    elif (len(familyname) == 0):
        response = create_response(False, 'Too short familyname')
    elif (len(email) == 0):
        response = create_response(False, 'Too short email')
    elif (len(passw) < 8):
        response = create_response(False, 'Too short password')
    elif (len(gender) == 0):
        response = create_response(False, 'Too short gender')
    elif (len(city) == 0):
        response = create_response(False, 'Too short city')
    elif (len(country) == 0):
        response = create_response(False, 'Too short country')
    else:
        #Approved data, continue registration
        result = database_helper.register_user(firstname, familyname, email, passw, gender, city, country)
        if (result):
            response = create_response(True, 'User registred')
        else:
            response = create_response(False, 'User already registred')
    return response

@app.route('/login', methods = ['POST'])
def sign_in():
    data = request.get_json()
    email = data['email']
    passw = data['password']

    #generate token
    letters = 'abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    token = ''

    for i in range(36):
        index = randint(0,len(letters)-1)
        token += letters[index]

    #try to login user
    result = database_helper.login_user(email, passw, token)
    if (result):
        return create_response(True, 'Successfully signed in', token)
    return create_response(False, 'Wrong username or password', token)

@app.route('/remove', methods = ['POST'])
def remove_user():
    data = request.get_json()
    email = data['email']

    if (database_helper.user_exists(email)):
        result = database_helper.delete_user(email)
        if (result):
            return create_response(True, 'Successfully removed user')
    else:
        return create_response(False, 'No such user')
    return create_response(False, 'Failed to remove user')

@app.route('/logout', methods = ['POST'])
def logout_user():
    data = request.get_json()

    if 'Authorization' in request.headers:
        a_token = request.headers.get('Authorization')

    ret = database_helper.logout_user(a_token)
    if (ret):
        return create_response(True, "User logged out")
    return create_response(False, "Could not log out user")

@app.route('/userloggedin', methods = ['POST'])
def user_logged_in():
    data = request.get_json()

    if 'Authorization' in request.headers:
        a_token = request.headers.get('Authorization')

    if database_helper.user_logged_in(a_token):
        return create_response(True, 'User is logged in')
    return create_response(False, 'User is not logged in')

@app.route('/userdatabyemail', methods = ['POST'])
def get_user_data_by_email():
    data = request.get_json()
    email = data['email']

    if 'Authorization' in request.headers:
        a_token = request.headers.get('Authorization')

    if (not database_helper.user_logged_in(a_token)):
        return create_response(False, 'You are not logged in')
    elif (database_helper.user_exists(email) == False):
        return create_response(False, 'No such user')

    result = database_helper.get_user_data(email)
    return create_response(True, "User data retrieved", result)

@app.route('/userdatabytoken', methods = ['POST'])
def get_user_data_by_token():
    data = request.get_json()

    if 'Authorization' in request.headers:
        a_token = request.headers.get('Authorization')

    email = database_helper.token_to_email(a_token)

    if (not database_helper.user_logged_in(a_token)):
        return create_response(False, 'You are not logged in')
    elif (database_helper.user_exists(email) == False):
        return create_response(False, 'No such user')

    result = database_helper.get_user_data(email)
    return create_response(True, "User data retrieved", result)

@app.route('/changepassword', methods = ['POST'])
def user_change_password():
    data = request.get_json()
    old_pass = data['old']
    new_pass = data['new']

    if 'Authorization' in request.headers:
        a_token = request.headers.get('Authorization')

    if (not database_helper.user_logged_in(a_token)):
        return create_response(False, 'You are not logged in')
    elif (len(new_pass) < 8):
        return create_response(False, 'Too short password')
    elif (len(new_pass) > 30):
        return  create_response(False, 'Too long password')

    stored_pass = (database_helper.get_user_password(database_helper.token_to_email(a_token)))
    if (stored_pass != old_pass):
        return create_response(False, 'Wrong password')
    else:
        email = database_helper.token_to_email(a_token)
        result = database_helper.set_user_password(new_pass, email)
        if (result):
            return create_response(True, 'Password changed')
    return create_response(False, 'Could not change password')

@app.route('/messagesbyemail', methods = ['POST'])
def user_get_messages_email():
    data = request.get_json()
    email = data['email']

    if 'Authorization' in request.headers:
        a_token = request.headers.get('Authorization')

    if (not database_helper.user_logged_in(a_token)):
        return create_response(False, 'You are not logged in')
    elif (not database_helper.user_exists(email)):
        return create_response(False, "No such user")
    else:
        data = database_helper.get_messages_by_email(a_token, email)
        if (data is not False):
            return create_response(True, "User messages retrieved", data)
    return create_response(False, "Something went wrong")

@app.route('/messagesbytoken', methods = ['POST'])
def user_get_messages_token():
    data = request.get_json()

    if 'Authorization' in request.headers:
        a_token = request.headers.get('Authorization')

    email = database_helper.token_to_email(a_token)
    print(email)

    if (not database_helper.user_logged_in(a_token)):
        return create_response(False, 'You are not logged in')
    elif (not database_helper.user_exists(email)):
        return create_response(False, "No such user")
    else:
        data = database_helper.get_messages_by_email(a_token, email)
        if (data is not False):
            return create_response(True, "User messages retrieved", data)
    return create_response(False, "Something went wrong")

@app.route('/postmessage', methods = ['POST'])
def user_post_message():
    data = request.get_json()
    message = data['message']
    email = data['email']

    if 'Authorization' in request.headers:
        a_token = request.headers.get('Authorization')

    sender = database_helper.token_to_email(a_token)

    if (not database_helper.user_logged_in(a_token)):
        return create_response(False, 'You are not logged in')
    elif (not database_helper.user_exists(email)):
        return create_response(False, "No such user")
    else:
        result = database_helper.post_message(email, sender, message)
        if (result):
            return create_response(True, "Message posted")
    return create_response(False, "Something went wrong")

if __name__ == '__main__':
    app.run(debug = True,port = 5000)
