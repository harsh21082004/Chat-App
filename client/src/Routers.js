import React, { useContext, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from './redux/slices/userSlice';

const Routers = () => {
    const dispatch = useDispatch();
    const {isLoggedIn, user} = useSelector((state) => state.user);

    const location = useLocation();
    const navigate = useNavigate();
    console.log(isLoggedIn, user)

    // // Redirect based on login status
    useEffect(() => {
        if (isLoggedIn && (location.pathname === '/login' || location.pathname === '/register')) {
            navigate('/', { replace : true}); // Redirect to home if logged in and accessing login/register
        } else if (!isLoggedIn && location.pathname !== '/login' && location.pathname !== '/register') {
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
        </Routes>
    );
};

export default Routers;
