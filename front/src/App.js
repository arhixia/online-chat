import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Welcome from './Welcome';
import Login from './Login';
import Register from './Register';
import Main from './Main';
import Chat from './Chat';
import './App.css';

const App = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserInfo(token);
        }
    }, []);

    const fetchUserInfo = async (token) => {
        try {
            const response = await fetch('http://localhost:8000/verify-token/' + token, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.username);
            } else {
                localStorage.removeItem('token'); // Очистить токен, если он невалиден
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user info', error);
            localStorage.removeItem('token'); // Очистить токен в случае ошибки
            setUser(null);
        }
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={user ? <Navigate to="/main" /> : <Welcome />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/main" element={user ? <Main user={user} setUser={setUser} /> : <Navigate to="/" />} />
                <Route path="/chat" element={user ? <Chat /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;





