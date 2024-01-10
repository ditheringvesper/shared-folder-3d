
const socket = io();

window.onload = init();


dragElement(document.querySelector(".previewWindow"));
dragElement(document.querySelector(".iconBound"));
// selectIcon(document.querySelector(".iconBound"));

// function that makes the element draggable; elmnt needs to be positioned right:
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


var iconBound = document.querySelector(".iconBound");
var previewWindow = document.querySelector(".previewWindow");
var previewFrame = document.querySelector("#previewFrame");
var previewinfo = document.querySelector('#previewinfo');
var previewfoto = document.querySelector('#previewfoto');
var previewtxt = document.querySelector('#previewtxt');

var folderName;
var folderNameArr = [];
var imgArr = [];
var iconImgArr = [];
var iconArr = [];
var filemess = document.querySelector(".filemess");
var iconDiv = document.querySelector(".iconBound");
var selectedIcon = [];
var thumbnailArr = [];

window.onload = loadFolderUIData(folderNameArr, thumbnailArr, iconImgArr)
.then(() =>{
    iconArr.forEach(eachIcon=>{
        selectIcon(eachIcon);
        dbClick(eachIcon);
    })
});

async function loadFolderUIData(){
    const datajson = await fetch("/midlayer.folderUI");
    const data = await datajson.json();
    folderNameArr = await data.folderName;
    thumbnailArr = await data.thumbnail;
    iconImgArr = await data.iconImg;
    // console.log(folderNameArr.length, thumbnailArr.length, iconImgArr.length, 'load 1'); 
    updateIconImg();
    return folderNameArr, thumbnailArr, iconImgArr;
};
function updateIconImg() {
    // console.log(folderNameArr.length, thumbnailArr.length, iconImgArr.length, 'load 2'); 
    let iconCount = iconImgArr.length;
    for (i = 0; i <= 500; i++) {
        var iconClone = iconDiv.cloneNode(true); // the true is for deep cloning
        var folderName = folderNameArr[Math.floor(Math.random() * folderNameArr.length)]+'_'+i;
        // var folderName = 'untitled folder ';
        iconClone.id = folderName;
        iconArr.push(iconClone);
        let thisIcon = iconArr[i];
        let newIcon = document.createElement('img');
        // newIcon.src = iconImgArr[Math.floor(Math.random() * iconCount)];
        newIcon.src = '/LMid_media/img/icons/folder-icon.png'; // folder img
        thisIcon.querySelector('#initialIcon').replaceWith(newIcon);
        thisIcon.querySelector('#iconTxt').innerHTML = folderName;

        let randX = Math.random() * window.innerWidth - 50;
        let randY = Math.random() * window.innerHeight - 50;
        thisIcon.style.transform = 'translate(' + randX + 'px,' + randY + 'px)';
        filemess.appendChild(thisIcon);

        dragElement(thisIcon);
        // selectIcon(thisIcon);
        thisIcon.style.visibility = 'visible';
    }
    iconDiv.style.visibility = 'visible';
    return iconArr;
};
function selectIcon(icon) {
    icon.onclick = () => {
        if(selectedIcon.length>0 && selectedIcon[0]!=icon){ // if selected icon is not pre-seleted
            // console.log('add this icon to array');
            selectedIcon[0].classList.remove("iconSelected");
            selectedIcon.length = 0;
            icon.classList.add("iconSelected");
            selectedIcon.push(icon);
            showPreview(icon);
        } 
        if(selectedIcon[0]==icon){
            return;
        }
        else if (selectedIcon.length == 0 ){ // if nothing is selected
            icon.classList.add("iconSelected");
            selectedIcon.push(icon);
            showPreview(icon);
        }
    }
};

function showPreview(icon){
    let start = new Date(2002, 0, 1);
    let date = randomDate(start, new Date(), 0, 24);
    let createdtime = date.toUTCString();
    if(selectedIcon.indexOf(icon)>=0){ // double insurance
    let imgIndex = Math.floor(Math.random()*thumbnailArr.length);
    previewfoto.src = `${thumbnailArr[imgIndex]}`;
    document.querySelector('#filename').innerHTML = icon.id;
    document.querySelector('#createdTime').innerHTML = createdtime;
    // var folderPath = createElement('span');
    // folderPath.innerHTML = icon.id;
    document.querySelector('#folderpath').innerHTML += `/${icon.id}`;
    document.querySelector('#fileType').innerHTML = 'Folder - '+ Math.floor(Math.random()*800)+' MB';
    previewinfo.style.visibility = 'visible';
    }
}
function dbClick(icon){
    icon.ondblclick=(icon)=>{
        var folderName = icon.id;
        var windowFeatures = "left=100,top=100,width=100,height=100";
        window.open('', folderName, windowFeatures);
    } 
}

function randomDate(start, end, startHour, endHour) {
    var date = new Date(+ start + Math.random() * (end - start));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    return date;
}

function init() { 

    document.body.addEventListener("click", function(e) {
        // var elm = e.target;
        // if (selectedIcon.length > 0 && iconArr.indexOf(elm.id) < 0){
        //     console.log(elm, 'clicked blank');
        //     // selectedIcon[0].classList.remove("iconSelected");
        //     // selectedIcon.length = 0;
        // }
        // else{
        //     return;
        // }
    });
   
}




// img seqs stopmotion 
socket.on('image', images => {
    async function loadImgs(imgArr) {
        for (i in images) {
            let newImg = document.createElement("img");
            newImg.src = `${images[i]}`;
            imgArr.push(newImg);
        }
        return imgArr;
    }

    loadImgs(imgArr).then(imgArr => {
        previewWindow.style.visibility = 'visible';
        let i = 0;
        var pauseImg = true;
        var timestamp = 0;
        var mY = 0;
        var speed = 1;
        setInterval(() => {
            if (!pauseImg) { // if play
                i++;
                if (i!=0){
                    previewWindow.removeChild(previewWindow.lastChild);
                }
                if (i >= imgArr.length) {
                    i = Math.floor(imgArr.length - imgArr.length * 0.3);
                    i++;
                    // console.log('again')
                    // clearInterval();
                }
                // console.log(i);

                previewWindow.appendChild(imgArr[i]);
                
                imgArr[i].style.zIndex = 2;
            }
        }, 1 / speed * 100);
        

        // previewWindow.addEventListener('mouseover', ()=>{pauseImg = false});
        previewWindow.querySelector('#triggerarea').addEventListener('mousemove', (e) => {
            pauseImg = false;
            var now = Date.now();
            currentmY = e.screenY;

            var dt = now - timestamp;
            var distance = Math.abs(currentmY - mY);
            speed = distance / dt * 1000;

            mY = currentmY;
            timestamp = now;
            return speed;
        });
        previewWindow.querySelector('#triggerarea').addEventListener('mouseleave', () => {
            pauseImg = true;
            timestamp = 0;
            mY = 0;
        });
    });
});



