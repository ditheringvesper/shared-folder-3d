const express = require('express');
const app = express();
const fs=require('fs');
const path=require('path');

const nedb = require('nedb');
let db = new nedb({
    filename: 'dir-database.db',
    autoload: true
})
db.find({}, function (err, docs) {
    // console.log("# of database entries:", docs.length);
  });
  
// const http = require("http").createServer(app);
const https = require('https');

const secureServer = https.createServer({
  key:fs.readFileSync(`/etc/letsencrypt/live/nonplace.site/privkey.pem`),
  cert:fs.readFileSync(`/etc/letsencrypt/live/nonplace.site/fullchain.pem`)
}, app);


const io = require('socket.io')(secureServer, {
  pingTimeout: 60000,
});
secureServer.listen(5555, () => {
  console.log('secure server started at 5555');
});
  
  
const peers = {};

app.use(express.static('public'));
app.set('view engine', 'ejs') ;

// app.use(urlEncodedParser)
// const multer = require('multer')
// const bodyParser = require('body-parser')
// const urlEncodedParser = bodyParser.urlencoded({extended: true})
// const upload = multer({
//     dest: 'public/uploads'
// })


app.get('/', (req, res, next) => { // 'next' means run next request after this; 
  res.render("folder.ejs", '');
});

// app.get('/js', (req, res, next) => { // 'next' means run next request after this; 
//   res.sendFile("public/folder.js", {root: __dirname});
// });

io.on("connection", (socket) => {
    // console.log(
    //   "new visitor id: ",
    //   socket.id
    // );
    db.find({}, function (err, docs) {
      // console.log(
      //   "Sending",
      //   docs.length,
      //   "existing database entries to new client"
      // );
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

      db.find({"fileInfo.fileid":'newFilename.fileInfo.fileid'}, (err, doc) => {
          if(doc){
            // console.log("this is new");
            db.insert(newFilename, (err, doc) => {
              // console.log("newFilename:", doc);
            });
          }
          else{
            // console.log('exsiting folder')
          }
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
                // console.log(numReplaced, "updated:",updates.filename);
            }
            );

        socket.broadcast.emit("updateFileInfo", updatedInfo);
        // console.log(updatedInfo);

      });


    // update on deleted files
    socket.on('deletedfile', (deletedfile)=>{
      db.find({"fileInfo.fileid": deletedfile}, (err, doc) => {
        // broadcast the del file
        socket.broadcast.emit("deletedfile", doc[0]);
        // console.log('broadcasting delete:', doc[0]);
      });

      // let delRegex = new RegExp(deletedfile);
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
      // console.log("Someone with ID", socket.id, "left the server");
      delete peers[socket.id];
      socket.broadcast.emit("notalone", 'n');
    });
  });

