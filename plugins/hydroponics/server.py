#!/usr/bin/python
from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
import threading, datetime, time

PORT_NUMBER = 8080

# holds stuff to go between threads or config
class common:
  cycleLen = 5 # length of a cycle (in minutes)
  cycleTime = (9, 38) # when the cycle should happen

  doCycle = False
  cycleInProgress = False

# for http
class myHandler(BaseHTTPRequestHandler):
  
  # handler for GET requests
  def do_GET(self):

    self.timeout = 2000

    # manually start the cycle
    if self.path == "/manual":

      # do a cycle
      if common.cycleInProgress == False:
        common.doCycle = True

        self.send_response(200)
        self.send_header('Content-type','text/html')
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write('{"OK": null}')
        return

      else:

        self.send_response(200)
        self.send_header('Content-type','text/html')
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write('{"ERR": "cycle in progress already"}')
        return


    else:
      self.send_response(404)
      self.send_header('Content-type','text/html')
      self.end_headers()
      self.wfile.write('Nothing here')
      return



def hydroponicBackgroundThread():
  while 1:
    if common.doCycle:
      # do a cycle

      common.cycleInProgress = True
      print "START WATER-CYCLE", time.strftime('%c')

      # pause (convert from minutes to seconds)
      time.sleep( common.cycleLen * 60 )

      print "END WATER-CYCLE", time.strftime('%c')
      print
      common.cycleInProgress = False
      common.doCycle = False


def markThread():

  def autoMarkCycleToStart():
    if common.cycleInProgress == False:
      print "MARKING WATER-CYCLE"
      common.doCycle = True

  while 1:
    m = datetime.datetime.now()

    if m.hour == common.cycleTime[0] and m.minute == common.cycleTime[1]:
      autoMarkCycleToStart()

    time.sleep(1)



try:
  server = HTTPServer(('', PORT_NUMBER), myHandler)
  print 'Started hydroponic\'s server on port' , PORT_NUMBER

  bgThread = threading.Thread(target=hydroponicBackgroundThread)
  bgThread.daemon = True
  bgThread.start()
  print 'Started background thread'

  cryThread = threading.Thread(target=markThread)
  cryThread.daemon = True
  cryThread.start()
  print 'Started crython thread\n'

  server.serve_forever()

except KeyboardInterrupt:
  print '^C received, shutting down the server'
  server.socket.close()