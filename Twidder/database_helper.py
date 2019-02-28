import sqlite3
from flask import g, jsonify

def connect_db():
    return sqlite3.connect("database.db")

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = connect_db()
    return db

def register_user(firstname, familyname, email, passw, gender, city, country):
    try:
        c = get_db()
        result = c.execute("insert into registered_users (firstname, familyname, email, password, gender, city, country) values (?,?,?,?,?,?,?)", [firstname,familyname,email,passw,gender,city,country])
        c.commit()
        return True
    except:
        return False

def login_user(email, password, token):
    c = get_db()
    result = c.execute("select * from registered_users where (email) = (?) AND (password) = (?)", [email, password])
    result = result.fetchone()

    result2 = c.execute("select * from logged_in_users where (email) = (?)", [email])
    result2 = result2.fetchone()
    if (result is not None and result2 is None):
        c.execute("insert into logged_in_users (email, token) values (?,?)", [email,token])
        c.commit()
        return True
    else:
        return False

def logout_user(token):
    c = get_db()
    stored_token = get_token()
    if (token == stored_token):
        c.execute("delete from logged_in_users where (token) = (?)", [token])
        c.commit()
        return True
    else:
        return False

def get_token():
    try:
        c = get_db()
        result = c.execute("select token from logged_in_users")
        result = result.fetchone()[0]
        c.commit()
        return result
    except:
        return False

def delete_user(email):
    try:
        c = get_db()
        result = c.execute("delete from registered_users where (email) = (?)", [email])
        c.commit()
        return True
    except:
        return False

def user_logged_in(token):
    try:
        c = get_db()
        result = c.execute("select * from logged_in_users where (token) = (?)", [token])
        result = result.fetchone()[0]
        c.commit()

        if (result == None):
            return False
        return True
    except:
        return False

def token_to_email(token):
    try:
        c = get_db()
        result = c.execute("select * from logged_in_users where (token) = (?)", [token])
        result = result.fetchone()[0]
        c.commit()

        if (result == None):
            return False
        return result
    except:
        return False

def user_exists(email):
    try:
        c = get_db()
        result = c.execute("select * from registered_users where (email) = (?)", [email])
        result = result.fetchone()[0]
        c.commit()
        if (result == None):
            return False
        return True
    except:
        return False

def get_user_data(email):
    try:
        c = get_db()
        result = c.execute("select * from registered_users where (email) = (?)", [email])
        result = result.fetchone()
        c.commit()
        if (result is not None):
            result = {"firstname" : result[0], "familyname" : result[1], "email" : result[2], "gender" : result[4], "city" : result[5], "country" : result[6]}
            return result
        result = {}
        return result
    except:
        result = {}
        return result

def get_user_password(email):
    try:
        c = get_db()
        result = c.execute("select password from registered_users where (email) = (?)", [email])
        result = result.fetchone()
        c.commit()
        if (result is not None):
            result = result[0]
            return result
        result = {}
        return result
    except:
        result = {}
        return result

def set_user_password(password, email):
    try:
        c = get_db()
        c.execute("update registered_users set password = (?) where email = (?)", [password, email])
        c.commit()
        return True
    except:
        return False

def get_messages_by_email(token, email):
    try:
        c = get_db()
        rows = c.execute("select message, sender from messages where (email) = (?)", [email])
        rows = rows.fetchall()

        result = []
        for row in range(len(rows)):
            message = "".join(rows[row][0])
            sender = "".join(rows[row][1])
            data = {'writer' : sender, 'content' : message}
            result.append(data)

        return result
    except:
        return False

def alter_table(command_string, parameter_array):
    try:
        c = get_db()
        result = c.execute(command_string, parameter_array)
        c.commit()
        return True
    except:
        return False

def post_message(email, sender, message):
    try:
        c = get_db();
        result = c.execute("INSERT INTO messages VALUES(?, ?, ?)", [email, sender, message])
        c.commit()
        return True
    except:
        return False

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def close_db():
    db = getattr(g, 'db', None)
    if db is not None:
        get_db().close()
