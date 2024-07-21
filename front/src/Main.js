import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';

const Main = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [showUsers, setShowUsers] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch users when the component is mounted
    useEffect(() => {
        fetchUsers(); // Fetch users when component mounts
    }, []);

    // Fetch messages and setup WebSocket when chat is opened
    useEffect(() => {
        if (showChat) {
            fetchMessages(); // Fetch messages when chat is opened

            const token = localStorage.getItem('token');
            if (token) {
                const socket = new WebSocket('ws://localhost:8000/ws/chat');
                socket.onopen = () => console.log('WebSocket connection established');
                socket.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    setMessages(prevMessages => [...prevMessages, message]);
                    scrollToBottom();
                };
                socket.onerror = (error) => console.error('WebSocket error:', error);
                setWs(socket);
            }

            return () => {
                if (ws) {
                    ws.close();
                }
            };
        }
    }, [showChat]);

    // Fetch users
    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('http://localhost:8000/users', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        }
    };

    // Fetch messages
    const fetchMessages = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await fetch('http://localhost:8000/messages', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages', error);
            }
        }
    };

    // Handle logout
    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await fetch('http://localhost:8000/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                localStorage.removeItem('token');
                setUser(null);
                navigate('/');
            } catch (error) {
                console.error('Error logging out', error);
            }
        }
    };

    // Toggle users list visibility
    const handleToggleUsers = () => {
        setShowUsers(!showUsers);
        if (!showUsers) {
            fetchUsers(); // Fetch users when showing the list
        }
    };

    // Handle sending a new message
    const handleSendMessage = async () => {
        if (newMessage && ws) {
            // Send message via WebSocket
            const message = {
                content: newMessage,
                author: user,
                timestamp: new Date().toISOString(),
            };
            ws.send(JSON.stringify(message));

            // Also save message via REST API
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    await fetch('http://localhost:8000/messages/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            content: newMessage,
                            user: user,
                        }),
                    });
                    setNewMessage(''); // Clear input after sending
                } catch (error) {
                    console.error('Error sending message', error);
                }
            }
        }
    };

    // Scroll to bottom of the messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Open chat
    const openChat = () => {
        setShowChat(true);
    };

    // Close chat
    const closeChat = () => {
        setShowChat(false);
    };

    return (
        <div className="main-container">
            <div className="main-header">
                <h1>Привет, {user}!</h1>
                <div className="header-buttons">
                    <div className="users-container">
                        <button onClick={handleToggleUsers} className="users-button">
                            {showUsers ? 'Скрыть пользователей' : 'Посмотреть всех пользователей'}
                        </button>
                        {showUsers && (
                            <div className="users-list">
                                <h2>Зарегистрированные пользователи:</h2>
                                <ul>
                                    {users.map((username) => (
                                        <li key={username}>{username}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <button onClick={handleLogout} className="logout-button">Выйти</button>
                </div>
            </div>
            <button onClick={openChat} className="chat-button">Перейти в чат</button>

            {showChat && (
                <div className="chat-modal">
                    <div className="chat-container">
                        <button className="chat-modal-close" onClick={closeChat}>×</button>
                        <div className="messages">
                            {messages.map((msg, index) => (
                                <div key={index} className={msg.author === user ? 'my-message' : 'other-message'}>
                                    <strong>{msg.author}</strong>
                                    <p>{msg.content}</p>
                                    <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Введите сообщение..."
                        />
                        <button onClick={handleSendMessage}>Отправить</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;







