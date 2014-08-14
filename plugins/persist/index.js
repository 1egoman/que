var path = require('path'),
fs = require('fs');

exports.queries = []

exports.services = {
  persist: function(name, services) {

    this.name = name;

    // read persistant data
    this.get = function() {
      // get path
      file_path = path.join( __dirname, "data", this.name+".json")

      // exists?
      if (!fs.existsSync(file_path)) {

        // make directory if needed
        try {
          fs.mkdirSync( path.join(__dirname, "data") )
        } catch(err) {}
        
        fs.writeFile(file_path, "{}");
        return {}
      }
      // read
      return JSON.parse( fs.readFileSync(file_path, 'utf8') || "{}" );
    };

    // write persistant data
    this.put = function(data) {
      // get path
      file_path = path.join( __dirname, "data", this.name+".json")

      // exists?
      if (!fs.existsSync(file_path)) {
        // make directory if needed
        try {
          fs.mkdirSync( path.join(__dirname, "data") )
        } catch(err) {}
      }

      // write
      fs.writeFileSync(file_path, JSON.stringify(data || {}, undefined, 2));
    };

  }
}