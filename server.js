const express = require("express");
const app = express();
app.use(express.static("public")); // phục vụ file HTML trong thư mục public
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});

const players = {};

io.on("connection", (socket) => {
  console.log("New player:", socket.id);
  socket.emit("remotePlayers", Object.values(players));


socket.on("playerUpdate", (data) => {
  if (
    typeof data.x !== "number" ||
    typeof data.y !== "number" ||
    typeof data.name !== "string" ||
    !data.sprite
  ) {
    console.warn("❌ playerUpdate bị bỏ qua vì thiếu dữ liệu:", data);
    return;
  }
    players[socket.id] = {
    ...data,
    socketId: socket.id
  };
    
  io.emit("remotePlayers", Object.entries(players).map(([id, p]) => ({
  ...p,
  socketId: id
})));

    // Gửi tất cả player khác về cho client này
    const others = Object.entries(players)
      .filter(([id]) => id !== socket.id)
      .map(([id, p]) => p);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    console.log("Player disconnected:", socket.id);
  });
});

http.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
