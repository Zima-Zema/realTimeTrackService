var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var request = require('request');
var http = require('http');


var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(cors());
app.set('view engine', 'ejs')
app.use(express.static('public'));

var server = http.createServer(app);
//HTTP SERVER
var io = require('socket.io')(server);
// Users Dic for users names and sockets
var parentDictionary = {};
var childDictionary = {};
var notificationDic = {};
// Listen for new connections
// Open new Socket for each request
io.on('connection', clientSocket => {
  console.log("connect");
  // Listen for new connection ..
  clientSocket.on('joinParent', parent => {
    // add socket and user name
    
      parentDictionary.parentId = childID;
      parentDictionary[parentID] = clientSocket;
      console.log("Parent>>>", parentID)
 
  });


  clientSocket.on('NotifyParent', parent => {
    // add socket and user name
      notificationDic[parent.id] = parent.token;
      console.log("Parent>>>", parent)
    
  });
  clientSocket.on('joinChild', childID => {
    // add socket and user name
   
      clientSocket.childId = childID;

      childDictionary[childID] = clientSocket;
      console.log("Child>>>", childID);
    

  });
  clientSocket.on('sendNotification', notification => {
    console.log("Notification>>", notification)
    console.log("NotificationToken>>", notificationDic[notification.to])
    request({
      url: 'https://fcm.googleapis.com/fcm/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=AAAAtqx7tBc:APA91bFGtGiGD8EmLoUVhv9AtFq538zjLcqbAQwH7t_OGaCuIGNws-hKR63SyvidBVGwi31aqMEJvj07j0Fyu99hWxiQyAflnfFxgfEHn0B6ruOQ8WfvD62seyjvoO-rPpejVWVZBwKs'
      },
      body: JSON.stringify({
        "data": {
          "message": notification.message,
          "title": notification.title,
          
        },
        "to": notificationDic[notification.to]
      })
    }, (error, respose, body) => {
      // console.log('error>>', error);
      // console.log('respose>>', respose);
      //console.log('body>>', body);
    })
  })
  // send message for certain user
  clientSocket.on('sendToParent', message => {
    parentDictionary[message.to].emit('message', message.data);
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
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
server.listen(process.env.PORT);
