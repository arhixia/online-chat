import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

const Chat = ({ user }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const socket = useRef(null);
    const navigate = useNavigate();
    const chatContainerRef = useRef(null);

    useEffect(() => {
        // Подключаемся к WebSocket
        socket.current = new WebSocket('ws://localhost:8000/ws/chat');

        // Обработка входящих сообщений
        socket.current.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, messageData]);
        };

        socket.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Очистка WebSocket при размонтировании компонента
        return () => {
            socket.current.close();
        };
    }, []);

    // Отправка сообщения
  const sendMessage = () => {
    if (message.trim() && user) {
        const messageData = {
            author: user,
            content: message,
            timestamp: new Date().toISOString(),
            user_id: user // Или другой способ идентификации пользователя
        };
        socket.current.send(JSON.stringify(messageData));
        setMessage('');
    } else {
        console.error('Message or user not defined');
    }
};



    // Прокрутка чата к последнему сообщению
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-container">
            <div className="chat-header">
                <button onClick={() => navigate('/main')} className="back-button">Назад</button>
                <h2>Чат</h2>
            </div>
            <div className="chat-messages" ref={chatContainerRef}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat-message ${msg.author === user ? 'my-message' : 'other-message'}`}
                    >
                        <div className="message-author">{msg.author}</div>
                        <div className="message-content">{msg.content}</div>
                        <div className="message-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                />
                <button onClick={sendMessage}>Отправить</button>
            </div>
        </div>
    );
};

export default Chat;


