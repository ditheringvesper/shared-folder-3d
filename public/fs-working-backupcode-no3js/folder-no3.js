
var folderArr = [];
var selectedFolder = []; // keep it only one slot available
var foldreToDB = {};

const socket = io();
const folderFileCtnr = document.querySelector('#folderFileCtnr');
const folderCtnr = document.querySelector('.folderCtnr'); // bg container window for all folders
const rightclick = document.querySelector('.rightclick');

document.addEventListener('load', socketConnection());
document.addEventListener('DOMContentLoaded', init);

function init(){

    // right click to create new folder
    folderCtnr.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        var postion = getRelativeCursorPos(e);
        var y = postion.curY;
        var x = postion.curX;
        rightclick.style.transform=`translate(${x+10}px, ${y+10}px)`;
        rightclick.style.visibility = 'visible';
    });

    rightclick.addEventListener('click', (evt)=> {
        evt.preventDefault();
        var postion = getRelativeCursorPos(evt);
        var y = postion.curY;
        var x = postion.curX;
        var createfolder = createNewFile(x,y,'new','new'); //evt.clientX, evt.clientY
        var newfolder = createfolder.newfolder;
        var timestamp = createfolder.timestamp;

        // console.log(document.getElementById(newfolder.id), folderArr.length);

        var newfolderData = {
            type: 'folder',
            filename: 'untitled folder',
            ct: timestamp,
            mt: timestamp,
            position: newfolder.getBoundingClientRect(),
            fileid: newfolder.id,
        }

        socket.emit('createdfiles', newfolderData);
    });

}   


folderCtnr.addEventListener("click", (e)=>{
    let target = e.target;
    if( e.target !==  rightclick || e.target == rightclick) { // this is stupid
        rightclick.style.visibility = 'hidden';
    }

    for(i=0; i<=folderArr.length; i++){
        if( target ==  folderArr[i]) { 
            if (selectedFolder.length == 0){
                folderArr[i].classList.add("folder-selected");
                folderArr[i].getElementsByTagName('p')[0].setAttribute('contenteditable', true);
                selectedFolder.push(folderArr[i]);
            }
           
            if (!folderArr[i].classList.contains('folder-selected') && selectedFolder.length>=1){ // if selected folder is new whereas there have been selected folder
                selectedFolder[0].classList.remove('folder-selected');
                selectedFolder[0].getElementsByTagName('p')[0].removeAttribute('contenteditable');
                selectedFolder = [];
                folderArr[i].classList.add("folder-selected");
                selectedFolder.push(folderArr[i]);
            }
            // console.log(target.getAttribute("class"));
        }
          
    }

    if(selectedFolder.length>=1 && target!==selectedFolder[0]){
        selectedFolder[0].classList.remove('folder-selected');
        selectedFolder=[];  
    }
    

    if(selectedFolder.length>=1 && target == selectedFolder[0]){
        var inputfield = selectedFolder[0].getElementsByTagName("p")[0];
        
        inputfield.addEventListener('keydown', (e)=>{    
            if(e.keyCode == 13){ // enter key
                var rename = inputfield.innerHTML;

                // now find the file id to update the filename
                let updateData = {
                    fileid: target.closest('div').id, // this folder's id
                    filename: rename,
                    mt: new Date().getTime(),
                }
                console.log(target.closest('div').id);
                socket.emit('updateFileInfo', updateData);
            }
        })
    }

    

})



// on double click -> direct to this folder
// folderCtnr.addEventListener("dblclick", (e)=>{
//     let target = e.target;

//     for(i=0; i<=folderArr.length; i++){
//         if( target ==  folderArr[i]) { 
//         }
            
// });


function getRelativeCursorPos(e){
    var rect = folderCtnr.getBoundingClientRect();
    var curX = e.clientX - rect.left; //x position within the element.
    var curY = e.clientY - rect.top;  //y position within the element.
    console.log(rect, curX, curY);
    return {curX, curY};
}

function createNewFile(x,y, id, fn){
    let timestamp = new Date().getTime();

    var newfolder = folderFileCtnr.cloneNode(true);
    newfolder.classList.add('folderIconStyle');
    newfolder.style.visibility = "visible";
    folderArr.push(newfolder);
    if(id=='new' && fn == 'new'){ // if is new and not in db
        newfolder.id = "folder" + timestamp; // folderArr.indexOf(newfolder);
        newfolder.getElementsByTagName('p')[0].innerHTML = 'untitled folder';
    }
    else{
        newfolder.id = id;
        newfolder.getElementsByTagName('p')[0].innerHTML = fn;
    }

    newfolder.querySelectorAll('[id="filename"]')[0].id += folderArr.indexOf(newfolder); // name its children as sep selector
    folderCtnr.appendChild(newfolder);
    document.getElementById(newfolder.id).style.left=`${x}px`;
    document.getElementById(newfolder.id).style.top=`${y}px`;

    console.log('new folder', newfolder.id, x, ' ', y);
    return {newfolder, timestamp};
}


// ------------------------------------------------------------------------ // 



// var inputVal = document.getElementById("filename").value;





// --------------------SOCKET---------------------------------------------------- // 
function socketConnection() {  
    console.log('socket connected');

    socket.on("createdfiles", (newFilename) => {
      console.log(
        newFilename.user,
        "created:",
        newFilename.fileInfo.fileid,
      );
      createNewFile(newFilename.fileInfo.position.x, newFilename.fileInfo.position.y, newFilename.fileInfo.fileid, newFilename.fileInfo.filename);
    });
  
    socket.on("existingfiles", (filesArr) => {
    //   console.log(filesArr);
      for (let i = 0; i < filesArr.length; i++) {
        let file = filesArr[i];
        let x = file.fileInfo.position.x;
        let y = file.fileInfo.position.y;
        let fileid = file.fileInfo.fileid;
        let filename = file.fileInfo.filename;
        createNewFile(x,y, fileid, filename);
        console.log(fileid, filename);
      }
    });

    socket.on("updateFileInfo", (updatedInfo)=>{
        let updatedfile = document.getElementById(`${updatedInfo.fileid}`);
        updatedfile.getElementsByTagName('p')[0].innerHTML = updatedInfo.filename;
        console.log('updating', updatedfile, updatedInfo);
    });


  }
  