require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const todoSchema = new mongoose.Schema({
  title: String,
  status: { type: String, enum: ['pending', 'processing', 'done'], default: 'pending' },
  locked_by: { type: String, default: null },
  updated_at: { type: Date, default: Date.now }
});
const Todo = mongoose.model('Todo', todoSchema);

// Redis adapter for Socket.IO
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});

// REST API: Get all todos
app.get('/api/todos', async (req, res) => {
  console.log(`[${INSTANCE_ID}] GET /api/todos - Request from ${req.ip}`);
  const todos = await Todo.find();
  res.json({ todos, instance: INSTANCE_ID });
});

// REST API: Create a todo
app.post('/api/todos', async (req, res) => {
  console.log(`[${INSTANCE_ID}] POST /api/todos - Request from ${req.ip}`);
  const todo = new Todo({ title: req.body.title });
  await todo.save();
  io.emit('task_list', await Todo.find());
  res.json({ ...todo.toObject(), instance: INSTANCE_ID });
});

// Socket.IO events
io.on('connection', (socket) => {
  socket.on('lock_task', async ({ taskId, userId }) => {
    console.log(`[${INSTANCE_ID}] Socket: lock_task - User ${userId} locking task ${taskId}`);
    const result = await Todo.findOneAndUpdate(
      { _id: taskId, locked_by: null },
      { $set: { locked_by: userId, status: 'processing', updated_at: new Date() } },
      { new: true }
    );
    if (result) {
      io.emit('task_locked', { taskId, userId, instance: INSTANCE_ID });
    } else {
      socket.emit('lock_failed', { taskId });
    }
  });

  socket.on('unlock_task', async ({ taskId, userId }) => {
    console.log(`[${INSTANCE_ID}] Socket: unlock_task - User ${userId} unlocking task ${taskId}`);
    const result = await Todo.findOneAndUpdate(
      { _id: taskId, locked_by: userId },
      { $set: { locked_by: null, status: 'pending', updated_at: new Date() } },
      { new: true }
    );
    if (result) {
      io.emit('task_unlocked', { taskId, instance: INSTANCE_ID });
    }
  });

  socket.on('get_tasks', async () => {
    console.log(`[${INSTANCE_ID}] Socket: get_tasks - Client requesting task list`);
    socket.emit('task_list', await Todo.find());
  });
});

const PORT = process.env.PORT || 5000;
const INSTANCE_ID = process.env.INSTANCE_ID || Math.random().toString(36).substr(2, 5);
server.listen(PORT, () => console.log(`Backend instance ${INSTANCE_ID} running on port ${PORT}`)); 