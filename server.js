const express = require("express");
const app = express();
const http = require("http").createServer(app); //httpサーバー作成
const io = require("socket.io")(http);

var roomList = new Set();
var chatLog = new Map();

const PORT = process.env.PORT || 3000;
//ポートか、ローカル時には3000を使用

app.use(express.static("public"));
//publicフォルダ内のファイルを使用

io.on("connection",(socket)=>{
  console.log("User Connected!");
  socket.on("join room",({room,username})=>{//roomとusernameを受け渡して
    socket.join(room);                      //roomに参加
    roomList.add(room);                     //Setに追加(配列とは違い、重複はできない)
    io.emit("roomList",Array.from(roomList)); //roomListを送信(配列に変換)
    console.log(`${username} joined in ${room}` );

    if(chatLog.has(room)){
      socket.emit("chatLog", chatLog.get(room));
    }
  });
  socket.on("Chat message",(msg)=>{//Chat message イベント発生時
    if(!chatLog.has(msg.room)){
      chatLog.set(msg.room,[]);
    }
    const log = chatLog.get(msg.room);
    log.push({
      "username":msg.username,
      "message":msg.message
             });
    if(log.length > 100){
      log.shift();
    }
    
    io.to(msg.room).emit("Chat message",msg);//msg.roomだけにmsgを送信
  });

  
  socket.on("disconnecting",()=>{//切断時(正確には切断する直前)
    for (var room of socket.rooms) {
      if (room !== socket.id) {
        var clients = io.sockets.adapter.rooms.get(room);//その部屋に属する人のSetを取得を取得
        //io.emit("roomUsers",clients.size);
        if (!clients || clients.size === 1) {//切断する直前が一人=>切断したら0人でルームを削除
          roomList.delete(room);//部屋削除
          chatLog.delete(room);
        }
      }
    }
  io.emit("roomList", Array.from(roomList));
    console.log("user disconnected!");
  });
});

http.listen(PORT,()=>{//サーバーの起動
  console.log("Server is running on port:"+PORT);
});



