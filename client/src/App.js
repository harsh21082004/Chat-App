import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Routers from './Routers';
import { useDispatch } from 'react-redux';
import { fetchAllUsers, fetchUserFromToken } from './redux/thunks/userThunks';
import { jwtDecode } from 'jwt-decode';

const App = () => {
    const dispatch = useDispatch();

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Get current time in seconds
            return decoded.exp < currentTime; // Check if the token is expired
        } catch (error) {
            return true; // If token is invalid or decoding fails, treat it as expired
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !isTokenExpired(token)) {
            dispatch(fetchUserFromToken(token));
            dispatch(fetchAllUsers(token)); // Fetch all users if token is valid
        } else {
            localStorage.removeItem('token'); // Remove expired token
        }
    }, [dispatch]);

    return (
        <Router>
            <Routers />
        </Router>
    );
};

export default App;
