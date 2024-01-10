import * as THREE from "three";
// import { OrbitControls } from "https://unpkg.com/three@0.148.0/examples/jsm/controls/OrbitControls.js";
import { TrackballControls } from 'https://unpkg.com/three@0.148.0/examples/jsm/controls/TrackballControls.js';
// import { ArcballControls } from 'https://unpkg.com/three@0.148.0/examples/jsm/controls/ArcballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'https://unpkg.com/three@0.148.0/examples/jsm/renderers/CSS3DRenderer.js';
// import { CSS2DRenderer, CSS2DObject } from 'https://unpkg.com/three@0.148.0/examples/jsm/renderers/CSS2DRenderer.js';

var folderArr = [];
var selectedFolder = []; // keep it only one slot available
var foldreToDB = {};

console.log('© 2023 - vesper guo - "www.guoyingzi.com" - @blinkingcaret')

const folderFileCtnr = document.querySelector('#folderFileCtnr');
const folderCtnr = document.querySelector('.folderCtnr');
const rightclick = document.querySelector('.rightclick');
const folderCtnrCanvas = document.getElementById( 'folderCtnrCanvas' );
const bg = document.querySelector('.bg');

var socket = io.connect({secure: true});

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

let css3DScene, roomScene;
let camera, renderer, css3Drenderer, css2Drenderer;
let dirLightRoomScene;
let boxMesh;
let filegoup = new THREE.Group();
let raycaster = new THREE.Raycaster();
let pointer;
let css3dControls;
const clock = new THREE.Clock();
const windowGroup = new THREE.Group();

document.addEventListener('load', socketConnection());
document.addEventListener('DOMContentLoaded', init());
animate();
InstructionFolders('hold "shift" to enable camera movement');
InstructionFolders("press 'r' to reset camera");
InstructionFolders("if you are stuck, refresh");
InstructionFolders("right click to create new folder");

function init(){
    // camera = new THREE.OrthographicCamera( - WIDTH/2, WIDTH/2, HEIGHT/2, - HEIGHT/2 - 1000, 1000 );
    camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.set(0,0,-800);
    // camera.position.set( -0.8104344635721908, -10.6618982351825667, 14.10337146594803);
    // camera.rotation.set(0.004264196492831991, 0.024736611262692474, 0.003950477064639461);

    css3DScene = new THREE.Scene();
    css3DScene.background = new THREE.Color( 'blue' );
    css3Drenderer = new CSS3DRenderer();
    css3Drenderer.setSize( folderCtnr.getBoundingClientRect().width, folderCtnr.getBoundingClientRect().height );
    folderCtnr.appendChild( css3Drenderer.domElement );
    // camera.lookAt(0,0,0);

    // add orbit controls
    // rendererControls = new OrbitControls(camera, renderer.domElement);

    // rendererControls.maxDistance = 5;
    // rendererControls.minDistance = 0;

    // const div1 = document.createElement( 'div' );
    // div1.classList.add('iframeDiv');
    // div1.style.width = folderCtnr.getBoundingClientRect().width*10;
    // div1.style.height = folderCtnr.getBoundingClientRect().height*10;
    // // div1.style.backgroundColor = 'blue';
    // const iframe1 = document.createElement( 'iframe' );
    // iframe1.style.width = folderCtnr.getBoundingClientRect().width/2;
    // iframe1.style.height = folderCtnr.getBoundingClientRect().height/2;
    // iframe1.src = 'http://localhost:5555/initFolder.html';
    // div1.appendChild( iframe1);
    // const css3d_object1 = new CSS3DObject( div1 );
    // css3d_object1.position.set(0,0,0);
    // css3DScene.add(css3d_object1);
    windowGroup.add(new newWindow( 0, 0, 350, 0, 0 ) );
    windowGroup.add(new newWindow( 350, 0, 0, Math.PI / 2 , 0 ) );
    windowGroup.add(new newWindow( 0, 0, - 350, Math.PI, 0  ) );
    windowGroup.add(new newWindow( - 350, 0, 0, - Math.PI / 2, 0  ) );
    windowGroup.add(new newWindow( 0, 350, 0, 0,  - Math.PI/2 ) );
    windowGroup.add(new newWindow( 0, -350, 0, 0,  - Math.PI/2 ) );

    css3DScene.add(windowGroup);
    camera.lookAt(windowGroup);

    // css3dControls = new OrbitControls(camera, css3Drenderer.domElement);
    css3dControls = new TrackballControls( camera, css3Drenderer.domElement );


    css3dControls.panSpeed = 1;
    css3dControls.rotateSpeed = 1;
    css3dControls.zoomSpeed = 1;

    css3dControls.enabled = false;
    document.addEventListener('keydown', (e)=>{
        if (e.key === 'Shift'){
            // folderCtnr.style.pointerEvents = 'none';
            // console.log('moving');
            css3dControls.enabled = true;
        }

        else{
            css3dControls.enabled = false;
        }
    });
    document.addEventListener('keyup', (e)=>{
        if(e.key === 'r'){
            css3dControls.reset();
        }
        css3dControls.enabled = false;
        folderCtnr.style.pointerEvents = 'visible';
    });
    // css3dControls.minDistance = 300;
    // css3dControls.maxDistance = 7500;
    // css3dControls.maxAzimuthAngle  = Math.PI/2;


    // roomScene = new THREE.Scene();
    // roomScene.background = new THREE.Color( 0x060708 );
    // renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setPixelRatio( window.devicePixelRatio );
    // renderer.setSize( window.innerWidth, window.innerHeight );
    // folderCtnr.appendChild( renderer.domElement );

    // let boxGeo = new THREE.BoxGeometry(12, 12, 12);
    // let boxMat = new THREE.MeshPhongMaterial({ 
    //     color: "blue",
    //     side: THREE.DoubleSide
    // });
    // boxMesh = new THREE.Mesh(boxGeo, boxMat);
    // roomScene.add(boxMesh);

    // dirLightRoomScene = new THREE.DirectionalLight( 0xffffff, 1 );
    // dirLightRoomScene.lookAt(boxMesh);
    // dirLightRoomScene.castShadow = true;
    // dirLightRoomScene.position.set( - 1, 0, 1 ).normalize();
    // roomScene.add( dirLightRoomScene );
    
    // let ambLightRoomScene = new THREE.AmbientLight( 0x404040,1 ); // soft white light
    // roomScene.add( ambLightRoomScene );

    css3Drenderer.domElement.style.zIndex = 0;
    // renderer.domElement.style.zIndex = 99;

}    // end of init

function animate() {

    requestAnimationFrame( animate );
    css3dControls.update();

    renderAll();
}


function newWindow(x,y,z,ry, rx){
    var div = document.createElement( 'div' );
    div.classList.add('iframeDiv');
    div.style.width = folderCtnr.getBoundingClientRect().width*10;
    div.style.height = folderCtnr.getBoundingClientRect().height*10;
    // div.style.backgroundColor = 'blue';
    var iframe = document.createElement( 'iframe' );
    iframe.style.width = '40em';
    iframe.style.height = '40em';
    iframe.src = 'https://nonplace.site:5555' //'http://nonplace.site:5555/folder.html';

    // preventign iframe loops
    // for(let i = 0; i<= window.frames.length; i++){
    //     let nodes = window.frames[i].window; //.document.getElementsByTagName('iframe');
    //     console.log(nodes.length);

    //     for(let k = 0; k < nodes.length; k++){
    //         console.log(k);

    //         // nodes[k].disabled = true;
    // }
    // }

    div.appendChild( iframe);

    var css3d_object = new CSS3DObject( div );
    css3d_object.position.set(x,y,z);
    css3d_object.rotation.y = ry;
    css3d_object.rotation.x = rx;
    return css3d_object;
}


// document.onkeydown = (e)=>{
//     if(e.key == "Shift"){
//         console.log(camera.position, camera.rotation);
//         // console.log({
//         //     "camPos": camera.position,
//         //     "filgroupPos": filegoup.position,
//         //     "filgroupContains": filegoup.children,
//         // });
//     }
//     }

function renderAll(){
    const time = Date.now() * 0.0005;
    const delta = clock.getDelta();

    windowGroup.rotation.x = Math.cos( time * 0.7 ) * 0.5;
    windowGroup.rotation.y = Math.cos( time * 0.5 ) * 0.4;
    windowGroup.rotation.z = Math.cos( time * 0.3 ) * 0.3;
    windowGroup.position.z = Math.cos( time * 0.3 ) * 0.3;

    // renderer.render( roomScene, camera );
    css3Drenderer.render( css3DScene, camera );
}

function setupRaycast(clientX, clientY) {  
    pointer = new THREE.Vector2();

    // three.js expects 'normalized device coordinates' (i.e. between -1 and 1 on both axes)
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(boxMesh);
  
    if (intersects.length) {
    let point = intersects[0].point;
    return point;
        
    }
}

// constructor of a 3d icon 
function css3dIcon( id, x, y, z) {
    var new3dIcon = new CSS3DObject( document.querySelector(`#${id}`) );
    new3dIcon.position.set(0,0,0);
    new3dIcon.scale.set(3,3,3);
    css3DScene.add(new3dIcon);
    // console.log('new3dicon:', new3dIcon);
    filegoup.add(new3dIcon);
    animate();
}


// draw 3js on canvas elements
// function ontoCanvas( canvas, fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight ) {

//     canvas.width = viewWidth * window.devicePixelRatio;
//     canvas.height = viewHeight * window.devicePixelRatio;

//     const context = canvas.getContext( '2d' );

//     const camera = new THREE.PerspectiveCamera( 20, viewWidth / viewHeight, 1, 10000 );
//     camera.setViewOffset( fullWidth, fullHeight, viewX, viewY, viewWidth, viewHeight );
//     camera.position.z = 1800;

//     this.render = function () {

//         camera.position.x += ( mouseX - camera.position.x ) * 0.05;
//         camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
//         camera.lookAt( scene.position );

//         renderer.setViewport( 0, fullHeight - viewHeight, viewWidth, viewHeight );
//         renderer.render( scene, camera );

//         context.drawImage( renderer.domElement, 0, 0 );
    // };

// }

function InstructionFolders(instruction){
    var fixedfolder = folderFileCtnr.cloneNode(true);
    fixedfolder.classList.add('folderIconStyle');
    fixedfolder.style.visibility = "visible";
    folderArr.push(fixedfolder);
    fixedfolder.getElementsByTagName('p')[0].innerHTML = instruction;
    // newfolder.querySelectorAll('[id="filename"]')[0].id += folderArr.indexOf(newfolder); // name its children as sep selector
    folderCtnr.appendChild(fixedfolder);
    let x = folderCtnr.getBoundingClientRect().left + Math.random()*folderCtnr.getBoundingClientRect().width - fixedfolder.getBoundingClientRect().width;
    let y = folderCtnr.getBoundingClientRect().top + Math.random()*folderCtnr.getBoundingClientRect().height - fixedfolder.getBoundingClientRect().height;
    fixedfolder.style.left=`${x}px`;
    fixedfolder.style.top=`${y}px`;
}



// ------- FS portion ----------------------------------------------------------------- // 
// if put these event listeners in init, the event might execute twise on each trigger!!!!
    // right click -> menu
folderCtnr.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    var postion = getRelativeCursorPos(e);
    var y = postion.curY;
    var x = postion.curX;
    rightclick.style.transform=`translate(${x+10}px, ${y+10}px)`;
    rightclick.style.visibility = 'visible';
});

// create new folder
rightclick.addEventListener('click', (evt)=> {
    evt.preventDefault();
    var postion = getRelativeCursorPos(evt);
    var y = postion.curY;
    var x = postion.curX;
    var boundW = postion.boundW;
    var boundH = postion.boundH;
    var createfolder = createNewFile(x,y,'new','new'); //evt.clientX, evt.clientY
    var newfolder = createfolder.newfolder;
    var timestamp = createfolder.timestamp;
    // let point = setupRaycast(x, y);
    // console.log('raycaster point:', point.x, point.y);

    // css3dIcon(newfolder.id, point.x, point.y, point.z);
    // css3dIcon(newfolder.id, (x / boundW) * 2 - 1, (y / boundH) * 2 - 1, 1); // -> doesn't work; mess up the new folder's position

    // console.log(newfolder.getBoundingClientRect());

    var newfolderData = {
        type: 'folder',
        filename: 'untitled folder',
        ct: timestamp,
        mt: timestamp,
        position: newfolder.getBoundingClientRect(),
        // position: {x: x, y: y},
        fileid: newfolder.id,
    }

    socket.emit('createdfiles', newfolderData);
});
    
folderCtnr.addEventListener('dblclick',(e)=>{
    e.preventDefault();
    let target = e.target;
    let windowFeatures = "left=100,top=100,width=800,height=600";
    for(let i=0; i<=folderArr.length; i++){
        if( target ==  folderArr[i]) { 
            window.open(window.location.href, windowFeatures,"popup");
        }
    }
});

// file deleting
document.addEventListener('keydown',(e)=>{
    if (selectedFolder.length>=1 && !selectedFolder[0].getElementsByTagName('p')[0].hasAttribute('contenteditable')){
        if(e.key === "Backspace"){
        let delId = selectedFolder[0].id;
        let deletedFile = document.getElementById(`${delId}`);
        folderArr.slice(deletedFile,1);
        selectedFolder[0].remove();
        socket.emit('deletedfile', delId);
        selectedFolder = [];
     }
    }
});
socket.on('deletedfile', (delFile)=>{
    // console.log("deleted", delFile.fileInfo.fileid);
    let deletedFile = document.getElementById(`${delFile.fileInfo.fileid}`);
    folderArr.slice(deletedFile,1);
    deletedFile.remove();
});

// file dragging and relocating
    var isDown = false;
    var relocFile;

    folderCtnr.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDown = true;
        if(relocFile==null){
            for(let i=0; i<=folderArr.length; i++){
                if( e.target == folderArr[i] && relocFile==null) { 
                    relocFile = folderArr[i];
            }}
        }
    }, true);
    document.addEventListener('mousemove', function(e) {
        e.preventDefault();
        // console.log(isDown, relocFile);
        if (isDown==true && relocFile!=null && relocFile!=undefined  && relocFile!=''){
            // for(let i=0; i<=folderArr.length; i++){
            //     if (event.target == folderArr[i]) {
            //         relocFile = folderArr[i];
            //     }
            // }
            var deltaX = e.movementX;
            var deltaY = e.movementY;
            var rect = relocFile.getBoundingClientRect();
            relocFile.style.left = rect.x + deltaX - folderCtnr.getBoundingClientRect().left + 'px';
            relocFile.style.top = rect.y + deltaY - folderCtnr.getBoundingClientRect().top + 'px';
        }
    }, true);
    document.addEventListener('mouseup', function(e) {
        e.preventDefault();
        if (isDown==true && relocFile!=null && relocFile!=undefined  && relocFile!=''){
                let relocInfo = {
                    id: relocFile.id,
                    newPosition: relocFile.getBoundingClientRect()
                }
                socket.emit("reloactedFile", relocInfo);
            }
            // relocInfo = {
            //     id: relocInfo.id,
            //     newPosition: relocInfo.getBoundingClientRect()
            // }
        isDown = false;
        relocFile = null;

            // update relocated file:
        socket.on("reloactedFile", (relocFile) =>{
            let relocElmt = document.getElementById(`${relocFile.id}`);
            relocElmt.style.left = relocFile.newPosition.left - folderCtnr.getBoundingClientRect().left + 'px';
            relocElmt.style.top = relocFile.newPosition.top - folderCtnr.getBoundingClientRect().top + 'px';

        });

        // console.log(isDown)
    }, true);




// file selecting
folderCtnr.addEventListener("click", (e)=>{
    e.preventDefault();
    let target;
    if(e.target.tagName == 'P'){
        target = e.target.parentElement;
    }
    else{
        target = e.target;
    } 

    if( target !==  rightclick || target == rightclick) { // this is stupid
        rightclick.style.visibility = 'hidden';
    }
    for(let i=0; i<=folderArr.length; i++){
        if( target ==  folderArr[i]) { 
            if (selectedFolder.length == 0){ // if no other currently seleted foler at the time
                selectedFolder.push(folderArr[i]);
                selectedFolder[0].classList.add("folder-selected");
            }

            if(selectedFolder.length>=1 && folderArr[i] != selectedFolder[0]){ // if there is selected but click on other folder
                selectedFolder[0].classList.remove('folder-selected');
                var inputfield = selectedFolder[0].getElementsByTagName("p")[0];
                if(inputfield.hasAttribute('contenteditable')){
                    inputfield.removeAttribute('contenteditable');
                    inputfield.blur();
                }
                // cancelSelStyle();
                selectedFolder=[];  
                selectedFolder.push(folderArr[i]);
                selectedFolder[0].classList.add("folder-selected");

            }
            // console.log(target.getAttribute("class"));

        }
 
    }

    if(!target.classList.contains('folderIconStyle') && selectedFolder.length>=1) { // if there is selected but click on blank canvs
        selectedFolder[0].classList.remove('folder-selected');
            var inputfield = selectedFolder[0].getElementsByTagName("p")[0];
            if(inputfield.hasAttribute('contenteditable')){
                inputfield.removeAttribute('contenteditable');
                inputfield.blur();
            }
        // cancelSelStyle();
        selectedFolder=[];  
    }

    // selected add style + file renaming
    if(selectedFolder.length == 1){
        var inputfield = selectedFolder[0].getElementsByTagName("p")[0];
        inputfield.addEventListener('click', ()=>{  
            inputfield.setAttribute('contenteditable', true);
            inputfield.focus();
        });
        inputfield.addEventListener('keydown', (e)=>{    
            if(e.key === "Delete" || e.key === "Backspace"){
                inputfield.innerHTML.slice(0,-1);
            }
            if(e.keyCode == 13){ // enter key
                var rename = inputfield.innerHTML;
                inputfield.blur();
                // now find the file id to update the filename
                let updateData = {
                    fileid: target.closest('div').id, // this folder's id
                    filename: rename,
                    mt: new Date().getTime(),
                }
                // console.log(target.closest('div').id);
                socket.emit('updateFileInfo', updateData);
            }
        });
    }

});



function getRelativeCursorPos(e){
    var rect = folderCtnr.getBoundingClientRect();
    var curX = e.clientX - rect.left; //x position within the element.
    var curY = e.clientY - rect.top;  //y position within the element.
    var boundX = rect.width; //x position within the element.
    var boundY = rect.height;  //y position within the element.
    // console.log('cur:', curX, curY, 'bouding:', boundX, boundY, "element:", e.target);
    return {curX, curY, boundX, boundY};
}

function createNewFile(x,y, id, fn){
    let timestamp = new Date().getTime();

    var newfolder = folderFileCtnr.cloneNode(true);
    newfolder.classList.add('folderIconStyle');
    newfolder.style.visibility = "visible";
    folderArr.push(newfolder);
    if(id =='new' && fn == 'new'){ // if is new and not in db
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

    let newfolderbound = newfolder.getBoundingClientRect();
    // console.log('new folder', newfolder.id, x, y, newfolderbound);
    return {newfolder, timestamp};
}


// ------------------------------------------------------------------------ // 



// var inputVal = document.getElementById("filename").value;





// --------------------SOCKET---------------------------------------------------- // 
function socketConnection() {  
    // console.log('socket connected');

    // receive live-created folders
    socket.on("createdfiles", (newFilename) => {
    //   console.log(
    //     newFilename.user,
    //     "created:",
    //     newFilename.fileInfo.fileid,
    //   );
      let x = newFilename.fileInfo.position.x - folderCtnr.getBoundingClientRect().left; // position in relation to the bounding window
      let y = newFilename.fileInfo.position.y - folderCtnr.getBoundingClientRect().top; 
      createNewFile(x, y, newFilename.fileInfo.fileid, newFilename.fileInfo.filename);
    });
  
    // load folders from db
    socket.on("existingfiles", (filesArr) => {
    //   console.log(filesArr);
      for (let i = 0; i < filesArr.length; i++) {
        let file = filesArr[i];
        // let x = file.fileInfo.position.x - folderCtnr.getBoundingClientRect().left; // position in relation to the bounding window
        // let y = file.fileInfo.position.y - folderCtnr.getBoundingClientRect().top;
        let x, y;
        if (file.fileInfo.position.x <= folderCtnr.getBoundingClientRect().left || file.fileInfo.position.x >= folderCtnr.getBoundingClientRect().left+folderCtnr.getBoundingClientRect().width){
            x = folderCtnr.getBoundingClientRect().left + Math.random()*folderCtnr.getBoundingClientRect().width;
            // x=folderCtnr.getBoundingClientRect().left + 0.5*folderCtnr.getBoundingClientRect().width
        }else{ x = file.fileInfo.position.x - folderCtnr.getBoundingClientRect().left; }
        if (file.fileInfo.position.y <= folderCtnr.getBoundingClientRect().top || file.fileInfo.position.y >= folderCtnr.getBoundingClientRect().top + folderCtnr.getBoundingClientRect().height){
            y = folderCtnr.getBoundingClientRect().top + Math.random()*folderCtnr.getBoundingClientRect().height;
            // y = folderCtnr.getBoundingClientRect().top + 0.5*folderCtnr.getBoundingClientRect().height;

        }else{ y = file.fileInfo.position.y - folderCtnr.getBoundingClientRect().top; }

        let fileid = file.fileInfo.fileid;
        let filename = file.fileInfo.filename;
        createNewFile(x, y, fileid, filename);
        // console.log(x,y, filename);
      }
    });

    socket.on("updateFileInfo", (updatedInfo)=>{
        let updatedfile = document.getElementById(`${updatedInfo.fileid}`);
        updatedfile.getElementsByTagName('p')[0].innerHTML = updatedInfo.filename;
        // console.log('updating', updatedfile, updatedInfo);
    });


  }
  



//--------- handy functions ------------//

// remove item from array by name
function removeByName(array, property, value) {
    array.forEach(function(result, index) {
      if(result[property] === value) {
        array.splice(index, 1);
      }    
    });
}
// drag and move
