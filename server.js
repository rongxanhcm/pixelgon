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

  socket.on("playerUpdate", (data) => {
    players[socket.id] = data;

    // Gửi tất cả player khác về cho client này
    const others = Object.entries(players)
      .filter(([id]) => id !== socket.id)
      .map(([id, p]) => p);

    socket.emit("remotePlayers", others);
    socket.broadcast.emit("remotePlayers", [data]); // gửi player này cho mọi người khác
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    console.log("Player disconnected:", socket.id);
  });
});

http.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
