var path = require('path'),
fs = require('fs');
require('sugar');

// exports.queries = []

exports.services = {
  query: {

    /*
    Assuming addition: we assume that the message has to do with adding 
    something to something else.
    */
    assumeAddition: function(query) {

      // define markers
      childWords = ["add", "new", "put"]
      parentWords = ["to", "on", "from", "in"]

      // run the operation
      return this.assumeChildParentOperation(query, childWords, parentWords)
    },

    /*
    Assuming creation: we assume that the message has to do with creating a child
    */
    assumeCreation: function(query) {

      // define markers
      parentWords = ["create", "construct", "spawn", "establish"]
      childWords = ["called", "named", "titled", "dubbed"]

      // run the operation
      return this.assumeChildParentOperation(query, childWords, parentWords)
    },

    /*
    Assuming subtraction: we assume that the message has to do with removing 
    something from something else.
    */
    assumeSubtraction: function(query) {

      // define markers
      childWords = ["delete", "remove", "check", "trim", "cut", "omit"]
      parentWords = ["to", "on", "from", "in"]

      // run the operation
      return this.assumeChildParentOperation(query, childWords, parentWords)
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
      return this.assumeChildParentOperation(query, childWords, parentWords)
    },


    /*
    A child parent operation is when the user expresses both a child, and a 
    parent of that child. Examples would include addition, creation, deletion, 
    or modification.
    */
    assumeChildParentOperation: function(query, childWords, parentWords) {

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