var wolfram = require('wolfram')

exports.queries = [
  {
    validate: /.*/gi,
    priority: -Infinity, // always last,
    wolframKey: "4W736E-Y82E88RJYQ", // the auth key
    then: function(query, services, callback) {

      client = wolfram.createClient(this.wolframKey)

      client.query(query, function(err, result) {
        if (err) throw err;

        if (!result) callback(false)

        // get response pod
        primary = result.find(function(item){
          return item.title == 'Response' || !item.title.has('Input')
        })

        if (primary) {
          queryText = primary.subpods[0].value.replace('\n', ';;')

          // do some formatting
          if ( queryText.has('|') ) {

            // split the query
            splitQuery = queryText.split(";;")
            splitQuery.each(function(i, ct){

              // get key and value
              key = i.split('|')[0]
              value = i.split('|')[1]

              // format it a little better
              splitQuery[ct] = "The " + key + " is " + value + ". "
            })

            queryText = splitQuery.join('')
          }

          callback({
            OK: queryText,
            image: primary.subpods[0].image || null
          })

        } else {
          callback({NOHIT: null})
        }
      })

    }
  }
]

exports.services = {}