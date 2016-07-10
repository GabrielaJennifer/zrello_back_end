var http = require("http");
var express = require('express');
var app = express();
var mysql = require("mysql");
var bodyParser = require('body-parser');
var Q = require('q');
// var connect = require("connect");

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:51740');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', true);

    next();
}


// First you need to create a connection to the db

app.set('port',3000);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(allowCrossDomain);

function createConnection() {
  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    port: "3301",
    database: "zrello"
  });
  con.connect(function(err){
    if(err){
      console.log('Error connecting to Db', err);
      return;
    }
    console.log('Connection established');
  });
  return con;
}





// http.createServer(function (request, response) {

//    // Send the HTTP header 
//    // HTTP Status: 200 : OK
//    // Content Type: text/plain
//    response.writeHead(200, {'Content-Type': 'text/plain'});
   
//    // Send the response body as "Hello World"
//    response.end('Hello World\n');
// }).listen(8081);



app.post('/createBoard', function(request, response) {
  //var store = { storeName: 'Globus', storeAddress: 'Adyar' };
  var board = request.body;
  //response.send(board);
  if(board.board_title && board.board_title.length > 0){
    var con = createConnection();
    con.query('INSERT INTO zrello.board SET ?', board, function(err,res){
      console.log("Res: ",res);
      if(err){
       console.log(err.message);
       var error = {

        error: true,
        errorMsg: err.message
       }
       response.send(error);

      } else {
        var success = {
          board : {board_id :res.insertId,
                  board_title:board.board_title},
          message : "Board Created",
          error : false
        }
        response.send(success);
      }

      
    });
  }else {
    var error = {

        error: true,
        errorMsg: "Param missing"
       }
       response.send(error);
  }
  
        
});

app.post('/createList', function(request, response) {
  //var store = { storeName: 'Globus', storeAddress: 'Adyar' };
  var list = {
    list_title :request.body.list_title
  }
  //response.send(board);
  if(list.list_title && list.list_title.length > 0){
    var con = createConnection();
    con.query('INSERT INTO zrello.list SET ?', list, function(err,res){
      console.log("Res: ",res);
      if(err){
       console.log(err.message);
       var error = {

        error: true,
        errorMsg: err.message
       }
       response.send(error);

      } else {
          var success = {
            list : {
              list_id:res.insertId,
              list_title: list.list_title
            },
            message : "List Created",
            error : false
          }
          response.send(success);
      }

      
    });
  }else {
    var error = {

        error: true,
        errorMsg: "Param missing"
       }
       response.send(error);
  }
  
        
});

app.post('/deleteList', function(request, response) {
  //var store = { storeName: 'Globus', storeAddress: 'Adyar' };
  console.log(request.body);
  var list = {
    list_id :request.body.list_id
  }
  //response.send(board);
  if(list.list_id){
    var con = createConnection();
    con.query('DELETE FROM zrello.list WHERE LIST_ID = ?', list.list_id, function(err,res){
      console.log("Res: ",res);
      if(err){
       console.log(err.message);
       var error = {

        error: true,
        errorMsg: err.message
       }
       response.send(error);

      } else {
          var success = {
            message: 'List deleted',
            error: false
          }
          response.send(success);

      }

      
    });
  }else {
    var error = {

        error: true,
        errorMsg: "Param missing"
       }
       response.send(error);
  }
  
        
});


app.post('/createCard', function(request, response) {
  //var store = { storeName: 'Globus', storeAddress: 'Adyar' };
  var list_id = request.body.list_id;
  var card = {
    card_title :request.body.card_title
  }
  //response.send(board);
  if(card.card_title && card.card_title.length > 0 && list_id){
    var con = createConnection();
    con.query('INSERT INTO zrello.card SET ?', card, function(err,res){
      console.log("Res: ",res);
      if(err){
       console.log(err.message);
       var error = {

        error: true,
        errorMsg: err.message
       }
       response.send(error);

      } else {
          var cardListMapping = {
            list_id: list_id,
            card_id : res.insertId
          }
          con.query('INSERT INTO zrello.card_list_mapping SET ?', cardListMapping, function(err1,res1){
          if(err1){
           var error = {

            error: true,
            errorMsg: err1.message
           }
           response.send(error);

          } else {
            var success = {
              card_id : res.insertId,
              card_title: card.card_title,
              message : "Card Created",
              error : false
            }
            response.send(success);
          }
        })
      }

      
    });
  }else {
    var error = {

        error: true,
        errorMsg: "Param missing"
       }
       response.send(error);
  }
  
        
});

app.get('/getBoard', function(request, response) {

    var con = createConnection();
    con.query('SELECT * FROM `board` LIMIT 1 ', null, function(err,rows){
     
      if(err){
       console.log(err.message);
       var error = {

        error: true,
        errorMsg: err.message
       }
       response.send(error);

      } else {
          console.log("rows : ",rows)
            con.query('SELECT l.list_id,l.list_title FROM `list` l', null, function(err,listrows){
              if(err){
               console.log(err.message);
               var error = {
                  error: true,
                  errorMsg: err.message
               }
               response.send(error);

              } else {
                var success = {
                  board: rows,
                  lists: listrows,
                  message : "Board returned",
                  error : false
                }
                response.send(success); 
               
              }
            });
        
       }

    });
  
        
});

app.post('/getList', function(request, response) {
  //var store = { storeName: 'Globus', storeAddress: 'Adyar' };
  //response.send(store);
  var board = request.body;
    var con = createConnection();
    con.query('SELECT l.list_title,l.list_id FROM `list` ', null, function(err,rows){
     
      if(err){
       console.log(err.message);
       var error = {

        error: true,
        errorMsg: err.message
       }
       response.send(error);

      } else {
        var success = {
          boards: rows,
          message : "Lists returned",
          error : false
        }
        response.send(success);
      }
    });

        
});

app.post('/getCard', function(request, response) {
  //var store = { storeName: 'Globus', storeAddress: 'Adyar' };
  //response.send(store);
  var list = request.body;
  if(list.list_id){
    var con = createConnection();
    con.query('SELECT c.card_id, c.card_title, c.card_desc, c.card_comments'+
    ' FROM `card` c '+
    'INNER JOIN `card_list_mapping` cl ON cl.card_id = c.card_id '+
    'where cl.list_id = ? ', list.list_id, function(err,rows){
     
      if(err){
       console.log(err.message);
       var error = {

        error: true,
        errorMsg: err.message
       }
       response.send(error);

      } else {
        var success = {
          cards: rows,
          message : "Cards returned",
          error : false
        }
        response.send(success);
      }
    });
  }else {
    var error = {

        error: true,
        errorMsg: "Param missing"
       }
       response.send(error);
  }
        
});


app.post('/getCardDetails', function(request, response) {
  //var store = { storeName: 'Globus', storeAddress: 'Adyar' };
  //response.send(store);
  var card_id = request.body.card_id;
  if(card_id){
    var con = createConnection();
    con.query('SELECT card_id, card_title, card_desc, card_comments'+
    ' FROM `card`'+
    'where card_id = ? ', card_id, function(err,rows){
     
      if(err){
       console.log(err.message);
       var error = {

        error: true,
        errorMsg: err.message
       }
       response.send(error);

      } else {
        var success = {
          card: rows[0],
          message : "Cards returned",
          error : false
        }
        response.send(success);
      }
    });
  }else {
    var error = {

        error: true,
        errorMsg: "Param missing"
       }
       response.send(error);
  }
        
});

app.post('/deleteCard', function(request, response) {
  //var store = { storeName: 'Globus', storeAddress: 'Adyar' };
  //response.send(store);
  var card_id = request.body.card_id;
  if(card_id){
    var con = createConnection();
    con.query('DELETE FROM `card_list_mapping`'+
    'where card_id = ? ', card_id, function(err,rows){
     
      if(err){
       console.log(err.message);
       var error = {

        error: true,
        errorMsg: err.message
       }
       response.send(error);

      } else {
        var success = {
          message : "Card deleted",
          error : false
        }
        response.send(success);
      }
    });
  }else {
    var error = {

        error: true,
        errorMsg: "Param missing"
       }
       response.send(error);
  }
        
});


app.post('/updateDesc', function(request, response) {
  //var store = { storeName: 'Globus', storeAddress: 'Adyar' };
  //response.send(store);
  var cardID = request.body.card_id;
  var card = {
    card_id : request.body.card_id,    
    card_desc: request.body.card_desc
  };
  console.log("Card : ",card);
  //response.send("hello");
  if(cardID){
    var con = createConnection();
    con.query('UPDATE `card` SET card_desc = ? '+
      ' WHERE card_id= ?', [card.card_desc, card.card_id], function(err,rows){
     
      if(err){
       console.log(err.message);
       var error = {

        error: true,
        errorMsg: err.message
       }
       response.send(error);

      } else {
        var success = {
          message : "Card updated",
          error : false
        }
        response.send(success);
      }
    });
  }else {
    var error = {

        error: true,
        errorMsg: "Param missing"
       }
       response.send(error);
  }
        
});

// con.end(function(err) {
//   // The connection is terminated gracefully
//   // Ensures all previously enqueued queries are still
//   // before sending a COM_QUIT packet to the MySQL server.
// });

//starting server
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
    createConnection();
});
