/**
  auth.js (https://github.com/1egoman/que)
  This file manages permissions for accessing the api's and the web ui.
*/
var config = {}, authStatus = {};
var sha256 = require("sha256");

// include the config
exports.init = function(cfg) {
  config = cfg;
  console.log("initialize: ", config);
}

// Check and see if a specific ip is logged in
exports.check = function(ip, dev) {
  console.log("check", authStatus[ip] || dev ? (authStatus[ip] || true) : false);
  return authStatus[ip] || dev ? (authStatus[ip] || true) : false;
}

// logout a specific ip
exports.expire = function(ip) {
  delete authStatus[ip];
}

// login; takes the request body, the ip, and if we are in dev mode or not
exports.authenticate = function(body, ip, dev) {
  var devmode = dev || false;

  if (!body.password && !devmode) {
    return false;
  }

  console.log("ARGS", body, ip, dev, config.password)
  console.log("test:", devmode, config.password.slice(1) == sha256(body.password))
  console.log("pass:", config.password.slice(1), sha256(body.password), sha256)

  // check the information (or, in developer mode)
  if ( devmode || config.password.slice(1) == sha256(body.password) ) {
    // success!
    authStatus[ip] = {
      status: "OK",
      username: config.user.first_name || "User",
      rights: 0,
      dev: devmode
    };
    console.log("returning true")
    return true;
  } else {
    return false;
  }
}