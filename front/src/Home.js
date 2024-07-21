import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = ({ user }) => {
    return (
        <div className="home-container">
            {user && <div className="username">Привет, {user}!</div>}
            <h1>Добро пожаловать на мой сайт Messenger!</h1>
            <div className="button-container">
                <Link to="/chat">
                    <button className="home-button">Перейти в чат</button>
                </Link>
            </div>
        </div>
    );
};

export default Home;


