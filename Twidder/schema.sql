DROP TABLE IF EXISTS registered_users;
DROP TABLE IF EXISTS logged_in_users;
DROP TABLE IF EXISTS messages;

CREATE TABLE registered_users(firstname varchar(30) NOT NULL,
                              familyname varchar(30) NOT NULL,
                              email varchar(30) NOT NULL,
                              password varchar(30) NOT NULL,
                              gender varchar(30) NOT NULL,
                              city varchar(30) NOT NULL,
                              country varchar(30) NOT NULL,
                              PRIMARY KEY(email));

CREATE TABLE messages(email varchar(30) NOT NULL,
                      sender varchar(30) NOT NULL,
                      message varchar(400) NOT NULL,
                      FOREIGN KEY(email) REFERENCES registered_users(email)
                      FOREIGN KEY(sender) REFERENCES registered_users(email));

CREATE TABLE logged_in_users(email varchar(30) NOT NULL,
                             token varchar(36) NOT NULL,
                             PRIMARY KEY(token));
