import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost');

function App() {
  const [todos, setTodos] = useState([]);
  const [userId] = useState(() => 'user_' + Math.random().toString(36).substr(2, 5));
  const [newTodo, setNewTodo] = useState('');
  const [currentInstance, setCurrentInstance] = useState('');

  useEffect(() => {
    fetch('http://localhost/api/todos')
      .then(res => res.json())
      .then(data => {
        console.log(`Served by instance: ${data.instance}`);
        setTodos(data.todos);
        setCurrentInstance(data.instance);
      });
    socket.emit('get_tasks');
    socket.on('task_list', setTodos);
    socket.on('task_locked', ({ taskId, userId: locker, instance }) => {
      console.log(`Task locked by instance: ${instance}`);
      setTodos(todos => todos.map(t => t._id === taskId ? { ...t, locked_by: locker, status: 'processing' } : t));
    });
    socket.on('task_unlocked', ({ taskId, instance }) => {
      console.log(`Task unlocked by instance: ${instance}`);
      setTodos(todos => todos.map(t => t._id === taskId ? { ...t, locked_by: null, status: 'pending' } : t));
    });
    return () => {
      socket.off('task_list');
      socket.off('task_locked');
      socket.off('task_unlocked');
    };
  }, []);

  const handleLock = (taskId) => {
    socket.emit('lock_task', { taskId, userId });
  };
  const handleUnlock = (taskId) => {
    socket.emit('unlock_task', { taskId, userId });
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTodo })
    });
    const data = await response.json();
    console.log(`Todo created by instance: ${data.instance}`);
    setNewTodo('');
  };
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Real-Time Todo List</h1>
      {currentInstance && (
        <div style={{ 
          background: '#e3f2fd', 
          padding: '8px 12px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          fontSize: '14px',
          color: '#1976d2'
        }}>
          🖥️ Currently served by: <strong>{currentInstance}</strong>
        </div>
      )}
      <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
        <input value={newTodo} onChange={e => setNewTodo(e.target.value)} placeholder="Add todo..." />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map(todo => (
          <li key={todo._id} style={{ marginBottom: 10 }}>
            <span>{todo.title} </span>
            {todo.status === 'processing' ? (
              <span style={{ color: 'orange' }}>
                Processing by {todo.locked_by === userId ? 'You' : todo.locked_by}
                {todo.locked_by === userId && (
                  <button onClick={() => handleUnlock(todo._id)} style={{ marginLeft: 10 }}>Unlock</button>
                )}
              </span>
            ) : (
              <button onClick={() => handleLock(todo._id)}>Process</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App; 