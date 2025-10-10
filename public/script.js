//ｷｬｰｯのぞき見よ！！！！
const socket = io();

var username = localStorage.getItem("username");//ユーザーネームを取得
var room = localStorage.getItem("room");

if (!username) {//なければユーザーネームを聞く
  username = prompt("plz enter username here...") || "NONAME";
  localStorage.setItem("username", username);
}
if(!room){//ルーム情報がなければルームを聞く
  room = prompt("plz enter room name here...");
  localStorage.setItem("room",room);
}

document.getElementById("room").textContent='Room:'+localStorage.getItem('room');

const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

form.addEventListener("submit", function(e) {
  e.preventDefault();//ページのリロードを停止
  if (input.value) {
   //サーバーにdetaオブジェクトを送信(Chat messageイベントを起こす)
   socket.emit("Chat message", {username:username,message:input.value,room:room});
   input.value = "";//入力欄を空に入力欄を空に
  }
});

socket.emit("join room",{username:username,room:room});//roomに入ったことを知らせる入ったことを知らせる

socket.on("Chat message", function(deta) {
  const item = document.createElement("li");//作成
  item.textContent = `${deta.username}:${deta.message}`;//detaのuserとmessageを取得し、つなげる
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;//スクロール
});

socket.on("roomList", function(roomArray) {
  const roomList = document.getElementById("roomList");
  roomList.innerHTML = ""; // 既存のリストをクリア
  
  const isRoomSet = !!localStorage.getItem("room");

  // リストが空で、roomが未設定なら prompt で聞く
  if (!isRoomSet && roomArray.length === 0) {
    const inputRoom = prompt("plz enter room name here...")?.trim();//trim()で余計な空白を削除
    if (inputRoom) {
      localStorage.setItem("room", inputRoom);
      location.reload();
    }
    return;
  }


  
  roomArray.forEach(roomName => {//roomArrayの長さだけ繰り返す
    const item = document.createElement("li");
    item.textContent = roomName;
    item.className="roomElm"
    item.style.cursor = "pointer";
    item.onclick = function() {
      if (confirm(`Join room: ${roomName}?`)) {//liクリック時にroomに入ることを確認
        localStorage.setItem("room", roomName);
        location.reload();
      }
    };
    roomList.appendChild(item);
  });
});

socket.on("chatLog",(log)=>{
  log.forEach((deta)=>{
    const item = document.createElement('li');
    item.textContent = `${deta.username}:${deta.message}`;
    messages.appendChild(item);
  });
  messages.scrollTop = messages.scrollHeight;
});


function chgusm(){
  username = prompt('New user name:');
  localStorage.removeItem("username");
  localStorage.setItem("username",username);  
  location.reload();
}
function chgroom(){
  room = prompt('Room:');
  localStorage.removeItem("room");
  localStorage.setItem("room",room);
  location.reload();
}
function sendImgInit(){
  const sendImg = document.getElementById("sendImg");
  const fileInput = document.getElementById("fileInput");
  sendImg.addEventListener('click',()=>{
    fileInput.click();//#sendImgクリック時に、#fileInputをクリック
  });
  
  fileInput.addEventListener('change',(event)=>{
    const file = event.target.files[0];//ファイルを代入
    if(!file) return;//ファイルじゃないなら引き返す
   
    const reader = new FileReader();//FileReaderを作成
    reader.onload=function(e){
      const base64 = e.target.result;
      const imgHTML = document.createElement("img");//imgを作成
      appendImage(username, base64);
      socket.emit("Chat image",{username: username, image:base64, room: room});
    };
    reader.readAsDataURL(file);
    
  });

}
sendImgInit();

function appendImage(user, base64) {
  const item = document.createElement("li");
  const imgHTML = document.createElement("img");
  imgHTML.src = base64;
  imgHTML.style.maxWidth = "500px";
  imgHTML.style.maxHeight = "500px";
  item.textContent = `${user}: `;
  item.appendChild(imgHTML);
  messages.appendChild(item);
}

socket.on('Chat image',(deta)=>{
  appendImage(deta.username,deta.image);
});


