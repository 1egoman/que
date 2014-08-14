require('sugar');
var path = require('path'),
    fs = require('fs'),
    curry = require('curry');

// Load all plugins and return an a list with their attributes
exports.loadAll = function() {
  plugin_dir = process.env.PLUGINS || path.join(__dirname, "plugins");
  plugins = fs.readdirSync( plugin_dir )

  allQueries = []
  allServices = []

  // loop through each plugin
  plugins.each(function(item){

    // get plugin root
    root = path.join(__dirname, "plugins", item)

    // read package.json, and merge with the plugin object
    // pkg_path = path.join(root, "package.json")
    // pkg = JSON.parse( fs.readFileSync(pkg_path, 'utf8') )
    // plugin = Object.merge(plugin, pkg)

    // get index.js
    index_path = path.join(root, "index.js")
    all = require(index_path)

    allQueries.add(all.queries)
    allServices.add(all.services)
  });

  // construct the object to return
  plugins = {}
  plugins.all = allQueries
  plugins.services = {}

  // add services to service array
  allServices.each(function(s, ct) {
    Object.merge(plugins.services, s);
  });

  // fill each service for all the others
  // Object.keys(plugins.services).each(function(p){
  //   if (typeof plugins.services[p] == "function") {
  //     plugins.services[p] = curry.to(plugins.services, plugins.services[p])
  //   }
  // });

  /*
  method validateFor(query)
  Try and validate a query on all the plugins loaded
  */
  plugins.validateFor = function(query) {
    var output;

    // loop through plugins
    plugins.all.each(function(plugin) {
      if (plugin && plugin.validate) {
        if (typeof plugin.validate == "function") {
          // get output of function
          resp = plugin.validate(query) || false
        } else {
          // otherwise, must be a regular expression
          resp = plugin.validate.test(query)// || false
        }

        // are we done?
        if (resp) {
          output = plugin;
          return
        }
      }
    });

    return output || false;
  }

  return plugins;
}
