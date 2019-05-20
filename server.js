var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
users = [];
characters = [];
connections = [];
characteruser = {};
usercharacter = {};

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

server.listen(process.env.PORT || 3000);
console.log('Server running...');

app.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  //Disconect
  socket.on('disconnect', function(data){
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  //Send message
  socket.on('send message', function(data){
    io.sockets.emit('new character', {msg: data, user:socket.username});
    console.log(data);
  });

  // New User
  socket.on('new user', function(data, callback){
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  //Send message
  socket.on('send character', function(data){
    if (!characters.includes(data)){
      characters.push(data);
    }
    updateCharacters();
    console.log(data);
  });

  //Start game
  socket.on('start game', function(){
    characters = shuffle(characters);
    for (i=0; i<users.length; i++) {
      characteruser[characters[i]] = users[i];
      usercharacter[users[i]] = characters[i];
    }
    updateGame();
  });

  function updateUsernames(){
    io.sockets.emit('get users', users);
  };

  function updateCharacters(){
    io.sockets.emit('get characters', characters);
  };

  function updateGame(){
    io.sockets.emit('start game', [usercharacter,characteruser]);
  };
});
