const express = require('express');
const app = express()
app.use(express.static('public'))
app.set('view engine', 'ejs') 

const nedb = require('nedb');
let db = new nedb({
    filename: 'dir-database.db',
    autoload: true
})
db.find({}, function (err, docs) {
    console.log("# of database entries:", docs.length);
  });
  
const http = require("http").createServer(app);
const server = app.listen(5555);
    console.log('server started on port 5555');
const io = require("socket.io")().listen(server);
const peers = {};

// app.use(urlEncodedParser)
// const multer = require('multer')
// const bodyParser = require('body-parser')
// const urlEncodedParser = bodyParser.urlencoded({extended: true})
// const upload = multer({
//     dest: 'public/uploads'
// })

io.on("connection", (socket) => {
    console.log(
      "new visitor id: ",
      socket.id
    );
    db.find({}, function (err, docs) {
      console.log(
        "Sending",
        docs.length,
        "existing database entries to new client"
      );
      socket.emit("existingfiles", docs);
    });
  
    peers[socket.id] = {};
  
    console.log("Current peers:", peers);
    // filename

    socket.on("createdfiles", (data) => {
      let newFilename = { 
        user: socket.id, 
        fileInfo: data, 
        };
      socket.broadcast.emit("createdfiles", newFilename);
      db.insert(newFilename, (err, doc) => {
        console.log("newFilename:", doc);
      });
    });


    // targeted file object; also call this when a new file is created
        // data includes file path
    socket.on("updateFileInfo", (updates) => {
        let updatedInfo = {
            fileid: updates.fileid,
            filename: updates.filename,
            mt: updates.mt,
        }
        db.find({"fileInfo.fileid":'updates.fileid'}, (err, doc) => {
          console.log("updated:", doc);
        });
        db.update(
            {"fileInfo.fileid": updates.fileid}, 
            { $set: { "fileInfo.filename": updates.filename, 
                        "fileInfo.mt": updates.mt } }, 
            { multi: false }, 
            function (err, numReplaced){
                console.log(numReplaced);
            }
            );
        socket.broadcast.emit("updateFileInfo", updatedInfo);
        console.log(updatedInfo);

      });

    // timestamp
    socket.on("timestamp", (data) => {
        let newTimestamp = { 
          user: socket.id, 
          timestamp: data, 
          };
        db.insert(timestamp, (err, doc) => {
          console.log("newFilename:", doc);
        });
      });



  
    socket.on("disconnect", () => {
      console.log("Someone with ID", socket.id, "left the server");
      delete peers[socket.id];
    });
  });

