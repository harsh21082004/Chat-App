import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import { useSelector, useDispatch } from 'react-redux';
import About from './components/About';

const Routers = () => {
    const dispatch = useDispatch();
    const {isLoggedIn, user} = useSelector((state) => state.user);


    const location = useLocation();
    const navigate = useNavigate();

    // // Redirect based on login status
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token && (location.pathname === '/login' || location.pathname === '/register')) {
            navigate('/', { replace : true}); // Redirect to home if logged in and accessing login/register
        } else if ((!token && location.pathname !== '/login') && ( !token && location.pathname !== '/register')) {
            navigate('/login', { replace : true}); // Redirect to login if not logged in and accessing protected routes
        }
    }, [isLoggedIn, location, navigate]);

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/status" element={<Home />} />
            <Route path="/calls" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
        </Routes>
    );
};

export default Routers;
