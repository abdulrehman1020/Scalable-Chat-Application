const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const Redis = require('ioredis');
const { produceMessage, startMessageConsumer } = require('./kafka');

const app = express();
const server = require('http').Server(app);
// const io = socketio(server);

dotenv.config();
const port = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB connection established successfully');
});

// Middleware
app.use(cors());
app.use(express.json());
 
startMessageConsumer()

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
const io = socketio(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const pub = new Redis({
  host: "",
  port: 0,
  username: "",
  password: "",
});

const sub = new Redis({
  host: "",
  port: 0,
  username: "",
  password: "",
});
sub.subscribe("MESSAGES", (err, count) => {
  if (err) {
    console.error("Error subscribing to MESSAGES channel:", err);
  } else {
    console.log(`Subscribed to MESSAGES channel. Count: ${count}`);
  }
});
// Socket.IO
io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected`);

  socket.on('sendMessage', async (message) => {
    console.log("🚀 ~ socket.on ~ message:", message)
    await pub.publish("MESSAGES", JSON.stringify({ message }));

    // io.emit('message', message);
  });

  sub.on("message", async (channel, message) => {
    if (channel === "MESSAGES") {
      console.log("new message from redis", message);
      io.emit("message", message);
      await produceMessage(message);
      console.log("Message Produced to Kafka Broker");
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});