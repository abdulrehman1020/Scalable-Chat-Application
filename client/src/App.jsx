import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  // const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  console.log("🚀 ~ App ~ message:", message)
  const [messages, setMessages] = useState([]);
  console.log("🚀 ~ App ~ messages:", messages)

  useEffect(() => {
    socket.on('message', (rawMessage) => {
      // Parse the message here
      const parsedMessage = JSON.parse(rawMessage);
  
      // Update state with the parsed message
      setMessages((prevMessages) => [...prevMessages, parsedMessage]);
    });
  }, []);
  

  const handleSubmit = (event) => {
    event.preventDefault();
    if (message) {
      socket.emit('sendMessage', { message });
      // setName('');
      setMessage('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* <input type="text" value={name} placeholder="Your name" onChange={(event) => setName(event.target.value)} /> */}
        <input type="text" value={message} placeholder="Your message" onChange={(event) => setMessage(event.target.value)} />
        <button type="submit">Send</button>
      </form>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            {message.message.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;