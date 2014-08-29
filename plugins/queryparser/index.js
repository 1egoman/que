var path = require('path'),
fs = require('fs');
require('sugar');

// exports.queries = []

/*
A child parent operation is when the user expresses both a child, and a 
parent of that child. Examples would include addition, creation, deletion, 
or modification.
*/
var assumeChildParentOperation = function(query, childWords, parentWords) {

  // define global marker
  allWords = childWords.union(parentWords)

  // for buffering words
  startKeeping = false
  wordBuffer = []

  // the results go here
  child = ""
  parent = ""


  discoverPhrase = function(buffer) {
    // console.log(buffer);

    if (childWords.indexOf(buffer[0]) !== -1) {
      // we have a subject!
      child = buffer.from(1).join(' ')
    }

    if (parentWords.indexOf(buffer[0]) !== -1) {
      // we have a subject!
      parent = buffer.from(1).join(' ')
    }        

    return buffer
  }

  // an iteration of the phrase-finding algorithm
  runIteration = function(q) {

    // what will be returned from the function
    var response;

    q.each(function(word){
      // is the word in the array?
      if ( allWords.indexOf(word) !== -1 ) {
        startKeeping = !startKeeping; // change if we are buffering words

        if (startKeeping == false) { // if we are no longer buffering words,
          response = wordBuffer // return the words we have buffered, because the next word changed startKeeping
          return false
        }

      }

      if (startKeeping) {
        wordBuffer.push(word) // append word to the buffer
      }

      // last word in the whole phrase? nothing of interest after, so return the buffer
      if (q.last() == word) {
        response = wordBuffer
        return false
      }
    });

    // clear the buffer
    wordBuffer = []
    return response || true;
  }

  // find the parent
  q = query.split(' ');
  for (i=0; i <= 5; i++) {

    // run an iteration to find important parts in the phrase
    out = runIteration(q)

    // true = no more interesting things left
    if (out === true) { break; }

    // subtract out the current iteration to find the next thing
    q = q.subtract(out)

    // lastly, figure out what was just removed
    discoverPhrase(out)

  }

  // only return if it was a success, otherwise false
  if (child) {
    return {child: child, parent: parent || false}
  } else {
    return false
  }
}

exports.services = {
  query: {

    /*
    Assuming addition: we assume that the message has to do with adding 
    something to something else.
    */
    assumeAddition: function(query) {

      // define markers
      childWords = ["called", "named", "titled", "dubbed", "add", "new", "put"]
      parentWords = ["to", "on", "from", "in"]

      // run the operation
      return assumeChildParentOperation(query, childWords, parentWords)
    },

    /*
    Assuming creation: we assume that the message has to do with creating a child
    */
    assumeCreation: function(query) {

      // define markers
      parentWords = ["create", "construct", "spawn", "establish"]
      childWords = ["called", "named", "titled", "dubbed"]

      // run the operation
      return assumeChildParentOperation(query, childWords, parentWords)
    },

    /*
    Assuming subtraction: we assume that the message has to do with removing 
    something from something else.
    */
    assumeSubtraction: function(query) {

      // define markers
      childWords = ["called", "named", "titled", "dubbed", "delete", "remove", "check", "trim", "cut", "omit"]
      parentWords = ["to", "on", "from", "in"]

      // run the operation
      return assumeChildParentOperation(query, childWords, parentWords)
    },

    /*
    Assuming deletion: we assume that the message has to do with deleting an 
    existing child
    */
    assumeDeletion: function(query) {

      // define markers
      parentWords = ["destroy"]
      childWords = ["called", "named", "titled", "dubbed"]

      // run the operation
      return assumeChildParentOperation(query, childWords, parentWords)
    },

    /*
    This parser liiks for times and reports the first one that it sees
    as a standard Date object
    */
    whenParser: function(query) {

      // define days of week
      delim = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      
      // months
      delim.add(["january", "jan"])
      delim.add(["febuary", "feb"])
      delim.add(["march", "mar"])
      delim.add(["april", "apr"])
      delim.add(["may"])
      delim.add(["june", "jun"])
      delim.add(["july", "jul"])
      delim.add(["august", "aug"])
      delim.add(["september", "sep", "sept"])
      delim.add(["october", "oct"])
      delim.add(["november", "nov"])
      delim.add(["december", "dec"])

      // other words
      delim.add(["tomorrow", "yesterday", "today"])


      // replace common spelling errors
      query = query.replace("tommorow", "tomorrow").replace("tomorow", "tomorrow").replace("tommorrow", "tomorrow")
      query = query.replace("on", " ") // can cause strange issues, is there a reason why this is bad?

      markers = []
      var ret = false

      // loop through each word in query
      query.split(' ').each(function(item, a) {

        // find the delimeters, and log their place
        delim.each(function(d, b){
          if (item.indexOf(d) !== -1) {
            markers.push(a)
          }
        })

      })

      // now, start at each day found, and look around it
      markers.each(function(loc){
        day = query.split(' ')[loc]

        // get the specified amount of words before and after
        // higher value: find more things, but it may not be able to distinguish between 2 phrases close together
        // lower value: vice verse
        words = 2 // here
        allwords = []
        for (i = -words; i <= words; i++) {
          allwords.push( query.split(' ')[loc+i] )
        }

        // now, start bruteforcing the dates until one matches
        for (i = 0; i <= words; i++) {

          // way one: without the first item
          one = allwords.slice(i).compact()
          console.log('  ', one)
          oneDate = Date.create(one.join(' '))
          console.log('  ->', oneDate)
          if ( oneDate != "Invalid Date" ) {
            ret = oneDate
            return
          }

          // way two: without the last item
          two = allwords.slice(0, -i).compact()
          console.log('  ', two)
          twoDate = Date.create(two.join(' '))
          console.log('  ->', twoDate)
          if ( twoDate != "Invalid Date" ) {
            ret = twoDate
            return
          }

          // way three: without both
          three = allwords.slice(i).slice(0, -i).compact()
          console.log('  ', three)
          threeDate = Date.create(one.join(' '))
          console.log('  ->', threeDate)
          if ( threeDate != "Invalid Date" ) {
            ret = threeDate
            return
          }

        }

      })

      return ret
    },

    /*
    Wrapper function for most of the stuff in this service. Give it a query
    and a callback (query, type, child-parent results, when) that returns the
    query result. The query should then return this.
    */
    childParentCallback: function(query, callback) {

        // creation?
        if ( /(create|construct|spawn|establish)/gi.test(query) ) {

        // parse query
        childParent = exports.services.query.assumeCreation( query )
        
        // try whenparser to get the time in the query
        when = exports.services.query.whenParser(query) || new Date()

        return callback(query, "creation", childParent, when)
      
      // subtraction?
      } else if ( /(delete|remove|check|trim|cut|omit)/gi.test(query) ) {

        // parse query
        childParent = exports.services.query.assumeSubtraction( query )
        
        // try whenparser to get the time in the query
        when = exports.services.query.whenParser(query) || new Date()

        return callback(query, "subtraction", childParent, when)

      // deletion?
      } else if ( /destroy/gi.test(query) ) {

        // parse query
        childParent = exports.services.query.assumeDeletion( query )
        
        // try whenparser to get the time in the query
        when = exports.services.query.whenParser(query) || new Date()

        return callback(query, "deletion", childParent, when)

      // addition?
      } else if ( /(add|new|put)/gi.test(query) ) {

        // parse query
        childParent = exports.services.query.assumeAddition( query )
        
        // try whenparser to get the time in the query
        when = exports.services.query.whenParser(query) || new Date()

        return callback(query, "addition", childParent, when)

      // none of the above
      } else {
        // parse query
        childParent = exports.services.query.assumeAddition( query )
        
        // try whenparser to get the time in the query
        when = exports.services.query.whenParser(query) || new Date()

        return callback(query, null, childParent, when)
      }
    }
  }
}

// tests
// console.log(exports.services.query.assumeAddition("on parent put child"))
// console.log('-----')
// console.log(exports.services.query.assumeSubtraction("omit item from parent"))
// console.log('-----')
// console.log(exports.services.query.assumeCreation("create parent called child"))
// console.log('-----')
// console.log(exports.services.query.assumeDeletion("delete parent called child"))
// console.log('-----')
// console.log(exports.services.query.assumeSubtraction("delete child from parent"))