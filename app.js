var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.set('view engine', 'ejs')
app.use(express.static('public'));
var http = require('http');
var server = http.createServer(app);
//HTTP SERVER
var io = require('socket.io')(server);
// Users Dic for users names and sockets
var parentDictionary = {}
var childDictionary = {}
// Listen for new connections
// Open new Socket for each request
io.on('connection', clientSocket => {
  console.log("connect");
  // Listen for new connection ..
  clientSocket.on('joinParent', parentID => {
    // add socket and user name
    clientSocket.parentId = parentID;
    parentDictionary[parentID] = clientSocket;
    console.log("Parent>>>",parentID)

  });
  clientSocket.on('joinChild', childID => {
    // add socket and user name
    clientSocket.childId = childID;
    
    childDictionary[childID] = clientSocket;
    console.log("Child>>>",childID);

  });
  // send message for certain user
  clientSocket.on('sendToParent', message => {
    parentDictionary[message.to].emit('message',message.data);
    clientSocket.emit("message", "Me : " + message.data);
    console.log(message);
  })
  clientSocket.on('sendToChild', message => {
    childDictionary[message.to].emit('message', message.data);
    clientSocket.emit("message", "Me : " + message.data);
    console.log(message);
  })
  clientSocket.on("message", data => {
    console.log(data);
    // respond to all clients
    if (clientSocket.parentId) {
      clientSocket.broadcast.emit("message", clientSocket.parentId + " says :" + data);
    }
    else {
      clientSocket.broadcast.emit("message", clientSocket.childId + " says :" + data);

    }
    // respond to the client
    clientSocket.emit("message", "Me : " + data);
  })

  // clientSocket.on("disconnect", () => {
  //   if (clientSocket.childId) {
  //     delete childDictionary[clientSocket.childId];

  //   }
  //   else {
  //     delete parentDictionary[clientSocket.parentId];

  //   }
  //   // new user logout
  //   //clientSocket.broadcast.emit("online_users", Object.keys(usersDictionary));
  // })
});

app.get("/", (req, resp) => {
  resp.render("index");
})

app.get("/users", (req, resp) => {
  resp.json(["item1", "item2", "item3"])
})

app.post("/users", bodyParser.json(), (req, resp) => {
  console.log(req.body);
  resp.send("ok");
})
server.listen(process.env.PORT);
