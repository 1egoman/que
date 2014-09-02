// get the config
var fs = require("fs"),
    config = JSON.parse( fs.readFileSync(__dirname + "/../config.json").toString() ),
    plugins = require("../lib/plugins"),
    query = require("../lib/query"),
    auth = require("../lib/auth"),
    chai = require("chai");

// initialize stuff
all = plugins.loadAll() // load plugins
query.init(all, config) // initialize query
auth.init(config) // initialize auth

// query template
var history = [];
queryTemplate = {
  query: {
    text: ""
  },
  ip: "127.0.0.1"
}

// chai constants
var expect = chai.expect;

// Plugins Tests
describe("plugins", function() {


  describe("Make sure there are plugins", function() {

    it("The .loadAll() method should return at least 1 query", function() {
      expect(all).to.be.a("object");
      expect(all.all).to.not.have.length(0);
    });

    it("The .loadAll() method should return at least 1 service", function() {
      expect(all).to.be.a("object");
      expect( Object.keys(all.services) ).to.not.have.length(0);
    });
  });

  describe("Query Tests", function() {

    it("A query with query.text=''", function() {

      // do query
      query.parse(queryTemplate, function(response) {
        expect(response).to.be.a("object");
        expect(response.OK).to.not.be.a("undefined");
      });
    });

    it("TestPlugin -> Normal Query", function() {

      // do query
      queryTemplate.query.text = "TestPlugin Normal Query";
      query.parse(queryTemplate, function(response) {

        expect(response).to.be.a("object");
        expect(response.OK).to.equal("Normal Response");
        expect(response.complete).to.equal(true);

      });
    });

    it("TestPlugin -> Chained Query", function() {

      // do 1st query
      queryTemplate.query.text = "TestPlugin Chained Query";
      query.parse(queryTemplate, function(response) {

        expect(response).to.be.a("object");
        expect(response.OK).to.equal("Chained Response");
        expect(response.complete).to.equal(false);

        // do 2nd query
        queryTemplate.query.text = "Chained Query #2";
        query.parse(queryTemplate, function(response) {

          expect(response).to.be.a("object");
          expect(response.OK).to.equal("Final Chained Response");
          expect(response.complete).to.equal(true);

        }, history);


      }, history);
    });

    it("TestPlugin -> Function Validation", function() {

      // do query
      queryTemplate.query.text = "TestPlugin Function Validation Query";
      query.parse(queryTemplate, function(response) {

        expect(response).to.be.a("object");
        expect(response.OK).to.equal("Win");
        expect(response.complete).to.equal(true);

      });
    });

    it("TestPlugin -> Priority Check", function() {

      // do query
      queryTemplate.query.text = "TestPlugin Priority Query";
      query.parse(queryTemplate, function(response) {

        expect(response).to.be.a("object");
        expect(response.OK).to.equal("Win");
        expect(response.complete).to.equal(true);

      });
    });
  });

  describe("Service Tests", function() {

    // for function tests
    describe("As Function", function() {

      it("Instantiation", function() {
        a = new all.services.TestPluginFunction();
        expect(a).to.be.a("object");
      });

      it("Service Methods", function() {
        a = new all.services.TestPluginFunction();
        expect( a.exampleMethod(1) ).to.equal("Arg was 1");
      });

      it("HTML Output", function() {
        a = new all.services.TestPluginFunction();
        expect( a.getData() ).to.equal("<p>Output</p>");
      });
    });

    // for object tests
    describe("As Object", function() {

      it("Instantiation", function() {
        a = all.services.TestPluginObject
        expect(a).to.be.a("object");
      });

      it("Service Methods", function() {
        a = all.services.TestPluginObject;
        expect( a.exampleMethod(1) ).to.equal("Arg was 1");
      });

      it("HTML Output", function() {
        a = all.services.TestPluginObject;
        expect( a.getData() ).to.equal("<p>Output</p>");
      });
    });
  });
});

// Authentication Tests
describe("auth", function() {

  it("Logging In", function() {

    // password exists?
    // expect(process.env.QUE_TEST_PASSWORD).to.not.be.a("undefined");

    authResponse = auth.authenticate({password: "1234"}, '127.0.0.1', false);
    expect(authResponse).to.equal(true);
  });

  it("Checking Login Status", function() {

    authResponse = auth.check('127.0.0.1')
    expect(authResponse).to.be.a("object");
    expect(authResponse.username).to.be.a("string");
    expect(authResponse.dev).to.equal(false);
  });

  it("Logging out", function() {
    auth.expire('127.0.0.1');

    authResponse = auth.check('127.0.0.1')
    expect(authResponse).to.equal(false);
  });
});