const express = require('express');
const app = express();
const fs=require('fs');

const nedb = require('nedb');
let db = new nedb({
    filename: 'dir-database.db',
    autoload: true
})
  
const https = require('https');

const secureServer = https.createServer({
  key:fs.readFileSync(`/etc/letsencrypt/live/nonplace.site/privkey.pem`),
  cert:fs.readFileSync(`/etc/letsencrypt/live/nonplace.site/fullchain.pem`)
}, app);


const io = require('socket.io')(secureServer, {
  pingTimeout: 60000,
});
secureServer.listen(443, () => {
  console.log('secure server started at 5555');
});
  
  
app.use(express.static('public'));
app.set('view engine', 'ejs') ;

app.get('/shared-folder', (req, res, next) => { 
  res.render("folder.ejs", '');
});

const peers = {};

io.on("connection", (socket) => {
    db.find({}, function (err, docs) {;
      socket.emit("existingfiles", docs);
    });
  
    peers[socket.id] = {};
  
    socket.on("createdfiles", (data) => {
      let newFilename = { 
        user: socket.id, 
        fileInfo: data, 
        };
      socket.broadcast.emit("createdfiles", newFilename);


    // targeted file object; also call this when a new file is created
        // data includes file path
    socket.on("updateFileInfo", (updates) => {
        let updatedInfo = {
            fileid: updates.fileid,
            filename: updates.filename,
            mt: updates.mt,
        }
        db.update(
            {"fileInfo.fileid": updates.fileid}, 
            { $set: { "fileInfo.filename": updates.filename, 
                        "fileInfo.mt": updates.mt } }, 
            { multi: false }, 
            function (err, numReplaced){
                // console.log(numReplaced, "updated:",updates.filename);
            }
            );
        socket.broadcast.emit("updateFileInfo", updatedInfo);
      });


    // update on deleted files
    socket.on('deletedfile', (deletedfile)=>{
      db.find({"fileInfo.fileid": deletedfile}, (err, doc) => {
        // broadcast the del file
        socket.broadcast.emit("deletedfile", doc[0]);
      });

      db.find({"fileInfo.fileid": deletedfile}, (err, doc) => {
        db.remove({"fileInfo.fileid":deletedfile}, { multi: true }, function (rmErr, numRemoved) {
          numRemoved = doc.length;
          // console.log('delete:', numRemoved);
          // db.find({}, function (err, docs) {console.log("left: ", docs.length)});
        });
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
      delete peers[socket.id];
      socket.broadcast.emit("notalone", 'n');
    });
  });
});
