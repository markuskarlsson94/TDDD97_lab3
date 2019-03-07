var PASSWORDLENGTH = 8;

window.onload = function() {
  if (userLoggedIn()) {
    loadHome();
  } else {
    loadWelcome();
  }

  hideMessage();
}

function insertHTML(source_id, dest_id) {
  //Will paste the innerHTML of source_id into the innerHTML of dest_id
  var source = document.getElementById(source_id);
  var dest = document.getElementById(dest_id);
  dest.innerHTML = source.innerHTML;
}

function insertString(string, dest_id) {
  //Will paste the given string into the innerHTML of dest_id
  var dest = document.getElementById(dest_id);
  dest.innerHTML = string;
}

function markTab(tab) {
  //Marks the selected tab in the navbar
  if (tab == "home") {
    var navbarTab = document.getElementById("navbarHome");
  } else if (tab == "browse") {
    var navbarTab = document.getElementById("navbarBrowse");
  } else if (tab == "account") {
    var navbarTab = document.getElementById("navbarAccount");
  }

  navbarTab.style.backgroundColor = "#2d3642";
}

function loadWelcome() {
  insertHTML("welcomeView", "content");
  hideMessage();
}

//function loadHome() {
  //alert("First");
          //userGetLoggedInEmail(); //This function function does not get the emial. It sets the displayedUser in localStorage
  //setDisplayedUser(email); //Make sure that logged in user's view is loaded
    //alert("First2");
  //insertHTML("navbarView", "content");
    //alert("First3");
  //insertHTML("profileView", "loggedInContent");
    //alert("First4");
  //markTab("home");
    //alert("First5");
  //userLoadInfo();
    //alert("First6");
  //userLoadMessages();
    //alert("First7");
  //hideMessage();
    //alert("First8");
//}

//function userGetLoggedInEmail() {
function loadHome() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var resp = JSON.parse(xhr.responseText);

      if (resp.status) {  //Denna check saknades så jag la till den
        localStorage.setItem("displayedUser", resp.data.email);
        insertHTML("navbarView", "content");
        insertHTML("profileView", "loggedInContent");
        markTab("home");
        userLoadInfo(resp);
        userLoadMessages();
        hideMessage();
      }
      else {
        console.log("fel i loadHome");
      }
    }
  }

  xhr.open("POST", "/userdatabytoken", true);
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.setRequestHeader("Authorization", localStorage.getItem("token"));
  xhr.send();
}

function loadBrowse() {
  insertHTML("navbarView", "content");
  insertHTML("browseView", "loggedInContent");
  markTab("browse");
  hideMessage();
}

function loadAccount() {
  insertHTML("navbarView", "content");
  insertHTML("accountView", "loggedInContent");
  markTab("account");
  hideMessage();
}

function userLoggedIn() {
  if (localStorage.getItem("token") === null ) {
    return false;
  }
  return true;
}

function validatePassword(form) {
  var pass1 = document.getElementById("registerPass1").value;
  var pass2 = document.getElementById("registerPass2").value;

  if (pass1.length < PASSWORDLENGTH) {
    displayErrorMessage("The chosen password is too short");
    return false;
  } else if (pass1 != pass2) {
    displayErrorMessage("The passwords do not match");
    return false;
  }

  return true;
}

function userSignIn(form) {
  var email = form.elements["loginEmail"].value;
  var pass = form.elements["loginPassword"].value;

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var resp = JSON.parse(xhr.responseText);
        if (resp.status) {
          localStorage.setItem("token", resp.data);
          hideMessage();
          loadHome();
        } else {
          displayErrorMessage(resp.message);
          console.log("fel i userSignIn");
        }
      }
    }
  xhr.open("POST", "/login", true);
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.send(JSON.stringify({"email" : email, "password" : pass}));
}

function userSignOut() {
  var token = localStorage.getItem("token");

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var resp = JSON.parse(xhr.responseText);
        if (resp.status) {
          localStorage.removeItem("token");
          localStorage.removeItem("displayedUser");
          loadWelcome();
        } else {
          displayErrorMessage(resp.message);
          console.log("fel i userSignOut");
        }
      }
    }

  xhr.open("POST", "/logout", true);
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.setRequestHeader("Authorization", localStorage.getItem("token"));
  xhr.send();
}

function registerUser(form) {
  var user = {email: form.elements["registerEmail"].value, password: form.elements["registerPass1"].value,
              firstname: form.elements["registerFirstName"].value, familyname: form.elements["registerFamilyName"].value,
              gender: form.elements["registerGender"].value, city: form.elements["registerCity"].value,
              country: form.elements["registerCountry"].value};

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var resp = JSON.parse(xhr.responseText);
        if (resp.status) {
          displayMessage("Succesfully registered user " + form.elements["registerEmail"].value);
        } else {
          displayErrorMessage(resp.message);
          console.log("fel i registerUser");
        }
      }
    }

  xhr.open("POST", "/register", true);
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.send(JSON.stringify(user));
}

function userTryRegister(form) {
  var valid = validatePassword(form);
  if (valid == true) {
    registerUser(form);
  }
}

function userTryChangePassword(form) {
  var token = localStorage.getItem("token");

  oldPass = form.elements["accountOldPassword"].value;
  newPass1 = form.elements["accountNewPassword"].value;
  newPass2 = form.elements["accountNewPassword2"].value;

  if (newPass1.length < PASSWORDLENGTH) {
    displayErrorMessage("New password is too short");
  } else if (newPass2.length < PASSWORDLENGTH) {
    displayErrorMessage("Retyped password is too short");
  } else if (newPass1 != newPass2) {
    displayErrorMessage("Passwords do not match");
  } else {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var resp = JSON.parse(xhr.responseText);
          if (resp.status) {
            displayMessage("Password successfully changed!");
          } else {
            displayErrorMessage(resp.message);
            console.log("fel i userTryChangePassword");
          }
        }
      }

    xhr.open("POST", "/changepassword", true);
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    xhr.setRequestHeader("Authorization", localStorage.getItem("token"));
    xhr.send(JSON.stringify({"old" : oldPass, "new" : newPass1}));
  }
}

function displayErrorMessage(message) {
  var error = document.getElementById("errorMessage");
  error.style.visibility = "visible";
  error.style.backgroundColor = "#ce4646";
  var p = document.getElementById("errorMessageParagraph"); //This has to be after thelocalStorage.setItem("displayedUser", resp.data.email);
  p.innerHTML=message;
}

function displayMessage(message) {
  var error = document.getElementById("errorMessage");
  error.style.visibility = "visible";
  error.style.backgroundColor = "#39a657";
  var p = document.getElementById("errorMessageParagraph"); //This has to be after the first paste because it cant find the id if it's inside a script tag
  p.innerHTML=message;
}

function hideMessage() {
    var error = document.getElementById("errorMessage");
    error.style.visibility = "hidden";
}

/*function userGetFullName(email) {
  var token = localStorage.getItem("token");
  var user = serverstub.getUserDataByEmail(token, email);
  return user.data.firstname + " " + user.data.familyname;
}*/

function userPostMessage(form) {
  //Post a message to the displayed user
  var token = localStorage.getItem("token");
  var email = getDisplayedUser();
  var message = form.elements["homeMessageField"].value;

  form.elements["homeMessageField"].value = "";

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var resp = JSON.parse(xhr.responseText);
        if (resp.status) {
          console.log(resp);
          userLoadMessages();
          //displayMessage("Succesfully registered user " + form.elements["registerEmail"].value);
        } else {
          displayErrorMessage(resp.message);
          console.log("fel i userPostMessages");
        }
      }
    }

  xhr.open("POST", "/postmessage", true);
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.setRequestHeader("Authorization", localStorage.getItem("token"));
  xhr.send(JSON.stringify({"message" : message, "email" : email}));
}

function userLoadMessages() {
  console.log("userLoadMessages börjar:");
  //Loads the wall for the displayed user
  var token = localStorage.getItem("token");
  console.log("token: ", token);
  var email = getDisplayedUser();
  console.log("email: ", email);

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var resp = JSON.parse(xhr.responseText);
      console.log(resp);

      if (resp.status) {

        var messageArray = resp.data;
        var length = messageArray.length;

        var anchor = document.getElementById("wallMessages");
        anchor.innerHTML = "";

        if (length > 0) {
            for (var i=0; i<length; i++) {
              //var sender = userGetFullName(messageArray[i].writer) + " " + "(" + messageArray[i].writer + ")";
              var sender = messageArray[i].writer;
              var message = messageArray[i].content;
              anchor.innerHTML += '<div class="wallMessageDiv module"><p class="wallMessageSender dark">' + sender + ':' + '</p>' + '<p class="wallMessageContent darkGrey">' + message + '</p>' + '</div>';
            }
          } else {
              anchor.innerHTML += '<div class="wallEmptyMessageDiv"><p>No messages :(</p></div>';
          }
      } else {
        displayErrorMessage(resp.message);
        console.log("fel i userLoadMessages");
      }
    }
  }

  xhr.open("POST", "/messagesbyemail", true);
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  //xhr.setRequestHeader("Authorization", localStorage.getItem("token"));
  xhr.setRequestHeader("Authorization", token);
  xhr.send(JSON.stringify({"email" : email}));

  console.log("userLoadMessages slutar");
}

function userLoadInfo(resp) {
    //Extracts user info from resp
    var firstname = resp.data.firstname;
    var familyname = resp.data.familyname;
    var fullname = firstname + " " + familyname;

    insertString(fullname, "profileFullName");

    var email = resp.data.email;
    insertString(email, "profileEmail");

    var gender = resp.data.gender;
    insertString('<span class="small darkGrey bold">gender: </span>' + gender,"profileGender");

    var country = resp.data.country;
    insertString('<span class="small darkGrey bold">country: </span>' + country, "profileCountry");

    var city = resp.data.city;
    insertString('<span class="small darkGrey bold">city: </span>' + city, "profileCity");
}

function userFind(form) {
  //Displays a user in the browse tab if found
  var token = localStorage.getItem("token");
  var email = form.elements["browseEmail"].value;

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var resp = JSON.parse(xhr.responseText);
      if (resp.status) {
        setDisplayedUser(email);
        insertHTML("profileView", "browseProfileAnchor");
        userLoadInfo(resp);
        userLoadMessages();
        hideMessage();
      } else{
          displayErrorMessage(resp.message);
          console.log("fel i userFind");
      }
    }
  }

  xhr.open("POST", "/userdatabyemail", true);
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
  xhr.setRequestHeader("Authorization", localStorage.getItem("token"));
  xhr.send(JSON.stringify({"email" : email}));
}

function setDisplayedUser(email) {
  localStorage.setItem("displayedUser", email);
}

function getDisplayedUser() {
  return localStorage.getItem("displayedUser");
}

function userDelete() {
  displayErrorMessage("Unable to delete account. You are stuck here forever lol");
}
