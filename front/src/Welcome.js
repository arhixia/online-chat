import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
    return (
        <div className="welcome-container">
            <h1>Добро пожаловать на мой сайт Messenger!</h1>
            <div className="button-container">
                <Link to="/login">
                    <button className="welcome-button">Войти</button>
                </Link>
                <Link to="/register">
                    <button className="welcome-button">Зарегистрироваться</button>
                </Link>
            </div>
        </div>
    );
};

export default Welcome;
