var path = require('path'),
fs = require('fs');

exports.queries = [
  {
    validate: /(list)/gi,
    then: function(query, services, callback) {

      var lists = new services.lists(services);

      if (query == "all lists") {
        return callback(lists.get().map(function(n){
          return n.name
        }).join(", "));
      }

      services.query.childParentCallback(query, function(query, type, cp, when) {

        // create list name from parent name
        var listName = (cp.parent || '').replace("list", '').replace("my", '').trim();

        // perform the correct action
        switch (type) {

          // add list item
          case "addition":
            lists.addItem(cp.child, listName);
            callback("Added list item '" + cp.child + "' to '" + listName + "' list");
            break;

          // delete list item
          case "subtraction":
            lists.delItem(cp.child, listName);
            callback("Removed list item '" + cp.child + "' from '" + listName + "' list");
            break;

          // create new list
          case "creation":
            var listName = (cp.child || '').replace("list", '').trim();
            lists.addList(listName, []);
            callback("Created new list named '" + listName + "'");
            break;

          // delete list
          case "deletion":
            var listName = (cp.child || '').replace("list", '').trim();
            lists.delList(listName)
            callback("Deleted list named '" + listName + "'");
            break;

          default:
            // by default, just say what's in the list
            var listName = (query || '').replace("list", '').replace("my", '').trim();

            // get the list
            item = lists.get().find(function(n){ return n.name == listName }) || callback("No list named "+listName);
            callback(  listName+" list: "+item.items.join(", ")  );
            break
        }
      })
    }
  }
]

exports.services = {

  lists: function(services) {

    // get calendar events
    this.get = function() {
      l = new services.persist("lists").get();
      return l.lists || [];
    }

    // put calendar events
    this.put = function(events) {
      l = new services.persist("lists");
      return l.put({lists: events});
    }

    // add a new list
    this.addList = function(title, items) {
      items = items || []
      lists = this.get();
      lists.push({name: title, items: items});
      return this.put(lists);
    }

    // delete a list
    this.delList = function(title) {
      lists = this.get();
      lists.remove(  lists.find(function(n){ return n.name == title }) || null  );
      this.put(lists);
    }

    // add a list item
    this.addItem = function(item, list) {
      lists = this.get();
      ourList = lists.find(function(n){ return n.name == list });
      ourList && ourList.items.push(item);
      this.put(lists);
      return ourList && true || false;
    }

     // delete a list item
    this.delItem = function(item, list) {
      lists = this.get();
      ourList = lists.find(function(n){ return n.name == list });
      ourList && ourList.items.remove(item);
      this.put(lists);
      return ourList && true || false;
    }

  }
}