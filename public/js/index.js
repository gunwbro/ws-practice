var socket = io("http://localhost:8005", {
  path: "/socket.io",
});
socket.on("news", function (data) {
  console.log(data);
  socket.emit("reply", "Hello Node.JS");
});
