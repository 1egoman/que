![Que](https://cdn.rawgit.com/1egoman/que/master/src/img/logo-black.svg "Que")
[![Build Status](https://travis-ci.org/1egoman/que.svg?branch=master)](https://travis-ci.org/1egoman/que)
===

Note: run `npm install` in the root and in each plugin folder (in /plugins/*) before running `node index.js`

config.json
===
An average user should only need to change:
- `port`: The network port that Que runs on
  - Default: 8000
  - Can be changed to any available port on the system ( < 1024 in unix often requires root )
- `password`: Change to whatever password you want to use to login to Que. 
  - Default: '1234'
  - It will be automatically hashed on first run for security. 


API Explaination
===

- `GET /api/services` Get a list of all services. Will return an array of objects in the form of:
```json
{
  "name": "internal service name",
  "title": "user-presented name",
  "html": "html page for plugin, or null"
}
```
- `GET /api/service/[serviceName]` Get service-defined information returned from the service's `this.getData` function, exactly like how it was returned only JSON stringified

- `GET /api/history` Get a command history since the server was started

- `POST /api/query` Send a query. At a minimum, the query's POST body must contain:
```json
{
  "query": {
    "text": "Query text"
  }
}
```
As a response, you'll get:
```json
{
  "OK": "Query response",
  "img": "Associated image"
}
```
("OK" can also be "ERR" for an error, or "NOHIT" for an error where a search failed, ex: a faild wolfram alpha query)


Licence
===

Copyright (c) 2014 Ryan Gaus (1egoman)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.