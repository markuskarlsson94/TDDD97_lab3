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

function loadHome() {
  setDisplayedUser(userGetLoggedInEmail()); //Make sure that logged in user's view is loaded
  insertHTML("navbarView", "content");
  insertHTML("profileView", "loggedInContent");
  markTab("home");
  userLoadInfo();
  userLoadMessages();
  hideMessage();
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

  var obj = serverstub.signIn(email, pass);

  if (obj.success == false) {
    displayErrorMessage(obj.message);
  }
  else {
    hideMessage();
    localStorage.setItem("token", obj.data);
    loadHome();
  }
}

function userSignOut() {
  var token = localStorage.getItem("token");
  var obj = serverstub.signOut(token);

  if (obj.success == false) {
    displayErrorMessage(obj.message);
  } else {
    localStorage.removeItem("token");
    loadWelcome();
  }
}

function registerUser(form) {
  var user = {email: form.elements["registerEmail"].value, password: form.elements["registerPass1"].value,
              firstname: form.elements["registerFirstName"].value, familyname: form.elements["registerFamilyName"].value,
              gender: form.elements["registerGender"].value, city: form.elements["registerCity"].value,
              country: form.elements["registerCountry"].value};

  var obj = serverstub.signUp(user);

  if (obj.success == false) {
    displayErrorMessage(obj.message);
  } else {
    displayMessage("Succesfully registered user " + form.elements["registerEmail"].value);
  }
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
    var obj = serverstub.changePassword(token, oldPass, newPass1);

    if (obj.success == false) {
      displayErrorMessage(obj.message);
    } else {
      displayMessage("Password successfully changed!");
    }
  }
}

function displayErrorMessage(message) {
  var error = document.getElementById("errorMessage");
  error.style.visibility = "visible";
  error.style.backgroundColor = "#ce4646";
  var p = document.getElementById("errorMessageParagraph"); //This has to be after the first paste because it cant find the id if it's inside a script tag
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

function userGetFullName(email) {
  var token = localStorage.getItem("token");
  var user = serverstub.getUserDataByEmail(token, email);
  return user.data.firstname + " " + user.data.familyname;
}

function userPostMessage(form) {
  //Post a message to the displayed user
  var token = localStorage.getItem("token");
  var email = getDisplayedUser();
  var message = form.elements["homeMessageField"].value;

  form.elements["homeMessageField"].value = "";
  serverstub.postMessage(token, message, email);
}

function userLoadMessages() {
  //Loads the wall for the displayed user
  var token = localStorage.getItem("token");
  var email = getDisplayedUser();
  var messageArray = serverstub.getUserMessagesByEmail(token, email).data;
  var length = messageArray.length;

  var anchor = document.getElementById("wallMessages");
  anchor.innerHTML = "";

  if (length > 0) {
      for (var i=length-1; i>=0; i--) {
        var sender = userGetFullName(messageArray[i].writer) + " " + "(" + messageArray[i].writer + ")";
        var message = messageArray[i].content;
        anchor.innerHTML += '<div class="wallMessageDiv module"><p class="wallMessageSender dark">' + sender + ':' + '</p>' + '<p class="wallMessageContent darkGrey">' + message + '</p>' + '</div>';
      }
    } else {
        anchor.innerHTML += '<div class="wallEmptyMessageDiv"><p>No messages :(</p></div>';
    }
  }

function userLoadInfo() {
  //Prints the info for the displayed user
  var token = localStorage.getItem("token");
  var email = getDisplayedUser();
  var obj = serverstub.getUserDataByEmail(token, email);
  var firstname = obj.data.firstname;
  var familyname = obj.data.familyname;
  var fullname = firstname + " " + familyname;

  insertString(fullname, "profileFullName");

  var email = obj.data.email;
  insertString(email, "profileEmail");

  var gender = obj.data.gender;
  insertString('<span class="small darkGrey bold">gender: </span>' + gender,"profileGender");

  var country = obj.data.country;
  insertString('<span class="small darkGrey bold">country: </span>' + country, "profileCountry");

  var city = obj.data.city;
  insertString('<span class="small darkGrey bold">city: </span>' + city, "profileCity");
}

function userGetLoggedInEmail() {
  //Gets the email of the logged in user
  var token = localStorage.getItem("token")
  var obj = serverstub.getUserDataByToken(token);
  var email = obj.data.email;
  return email;
}

function userFind(form) {
  //Displays a user in the browse tab if found
  var token = localStorage.getItem("token");
  var email = form.elements["browseEmail"].value;
  var obj = serverstub.getUserDataByEmail(token, email);

  if (obj.success) {
    setDisplayedUser(email);
    insertHTML("profileView", "browseProfileAnchor");
    userLoadInfo();
    userLoadMessages();
    hideMessage();
  } else {
    displayErrorMessage(obj.message);
  }
}

function setDisplayedUser(email) {
  localStorage.setItem("displayedUser", email);
}

function getDisplayedUser(email) {
  return localStorage.getItem("displayedUser");
}

function userDelete() {
  displayErrorMessage("Unable to delete account. You are stuck here forever lol");
}
