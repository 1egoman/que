var all, config;


// Initializes the query parser; takes a plugin list and the config file
exports.init = function(al, cfg) {
  all = al; config = cfg;
}
/*
Parse a query. 
takes the query body, 
a callback with an argument containing the response, 
and an optional history list
*/
exports.parse = function(body, finalCallback, history) {

  history = history || []

  // create callback object
  var callbackObject = function(text, status, callback) {

    // failed request
    text || finalCallback( {ERROR: status || null} )

    // create packet, if it isn't already
    if (typeof text == "string") {
      packet = {"OK": text, "complete": callback == undefined}
    } else {
      packet = text;
    }

    // add to history
    hist = {packet: packet, when: new Date(), query: body, complete: callback == undefined, callback: callback, status: status}
    history.push(hist)

    // end of query
    finalCallback( packet );
  }

  // no query
  if (!body.query.text) {
    finalCallback( {OK: "No Query"} )
    return;
  }

  if (history.length == 0 || history[history.length-1].complete == true) {

    // sort all plugins based on priority
    all.all = all.all.sortBy(function(n) {
      return n.priority || 0
    })

    // do query
    resp = all.validateFor(body.query.text)

    // if query was successful, continue
    if (resp != false) {

      // get the plugin's response
      // body.ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
      resp.then(body.query.text, all.services, callbackObject, body)

    } else {
      // no plugin's matched the query
      finalCallback( "{NOHIT: null}" )
    }

  } else {
    // otherwise, just run the callback
    hist = history[history.length-1]
    if (hist.status && hist.status.type == "boolean") {

      // do a boolean operation
      ifTrue = body.query.text.split(' ').intersect(config.trueWords).length > 0
      ifFalse = body.query.text.split(' ').intersect(config.falseWords).length > 0

      // check it
      if (ifTrue && !ifFalse) {
        hist.callback(true, null, callbackObject)
      } else if (!ifTrue && ifFalse) {
        hist.callback(false, null, callbackObject)
      } else {
        hist.callback(body.query.text, null, callbackObject)
      }

    } else {
      hist.callback(body.query.text, null, callbackObject)
    }
  }


}