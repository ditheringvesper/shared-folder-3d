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
  
    // console.log("Current peers:", peers);
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
        // db.find({"fileInfo.fileid":'updates.fileid'}, (err, doc) => {
        //   console.log("updated:", doc._id);
        // });
        db.update(
            {"fileInfo.fileid": updates.fileid}, 
            { $set: { "fileInfo.filename": updates.filename, 
                        "fileInfo.mt": updates.mt } }, 
            { multi: false }, 
            function (err, numReplaced){
                console.log(numReplaced, "updated:",updates.filename);
            }
            );

        socket.broadcast.emit("updateFileInfo", updatedInfo);
        console.log(updatedInfo);

      });


    // update on deleted files
    socket.on('deletedfile', (deletedfile)=>{
      db.find({"fileInfo.fileid": deletedfile}, (err, doc) => {
        // broadcast the del file
        socket.broadcast.emit("deletedfile", doc[0]);
      });
      db.remove({"fileInfo.fileid":deletedfile}, {}, function (err, numRemoved) {
        numRemoved = 1;
        console.log('delete:', doc);

      });
    });

     // update on relocated files
     socket.on('reloactedFile', (relocFile)=>{
      // for debuggign:
      // db.find({"fileInfo.fileid": relocFile.id}, (err, doc) => {
      //   console.log("updated:", doc[0].fileInfo.position.x);
      // });
      db.update({"fileInfo.fileid": relocFile.id}, 
        { $set: { "fileInfo.position": relocFile.newPosition} }, 
        { multi: true }, 
        function (err, numReplaced){
            socket.broadcast.emit("reloactedFile", relocFile);
            // console.log('reloacted:', relocFile.newPosition.x);
        });
    });
      
    


    // see each one's cursor
    socket.on("cursorpeers", (data) => {
        let gotPosition = { 
            who: socket.id,
            x: data.x, 
            y: data.y, 
          };
          socket.broadcast.emit("cursorpeers", gotPosition);
          socket.broadcast.emit("notalone", 'y');
      });



  
    socket.on("disconnect", () => {
      console.log("Someone with ID", socket.id, "left the server");
      delete peers[socket.id];
      socket.broadcast.emit("notalone", 'n');
    });
  });

