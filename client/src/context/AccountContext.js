import React, { createContext, useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

export const AccountContext = createContext();

const AccountProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [person, setPerson] = useState({});
    const [chatPerson, setChatPerson] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [openChats, setOpenChats] = useState([]); // For multiple open chats

    const socket = useRef();

    // 🔄 Add person to openChats (only if not already present)
    const addToOpenChats = (person) => {
        setOpenChats(prev => {
            const alreadyOpen = prev.find(p => p._id === person._id);
            return alreadyOpen ? prev : [...prev, person];
        });
    };

    // ❌ Remove person from openChats
    const removeFromOpenChats = (personId) => {
        setOpenChats(prev => prev.filter(p => p._id !== personId));
    };

    // 🔌 Socket connection setup
    useEffect(() => {
        socket.current = io('ws://localhost:9000');

        socket.current?.on('connect', () => {
            console.log('Connected to server');
        });

        socket.current?.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        socket.current?.on('getUsers', users => {
            setActiveUsers(users);
        });

        return () => {
            socket.current.disconnect();
        };
    }, []);

    // 🕓 Fetch user from localStorage token
    useEffect(() => {
        fetchUserDetails();
    }, []);

    const isTokenExpired = (token) => {
        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp < currentTime;
        } catch (error) {
            return true;
        }
    };

    const fetchUserDetails = () => {
        const token = localStorage.getItem('token');
        if (token && !isTokenExpired(token)) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    _id: decoded._id,
                    name: decoded.name,
                    email: decoded.email,
                    profilePhoto: decoded.profilePhoto,
                    mobileNumber: decoded.mobileNumber,
                });
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Error decoding token:', error);
                setUser(null);
                setIsLoggedIn(false);
            }
        } else {
            socket?.current?.emit("disconnectedUser");
            localStorage.removeItem('token');
            setUser(null);
            setIsLoggedIn(false);
        }
    };

    const logout = () => {
        socket?.current?.emit("disconnectedUser", user);
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <AccountContext.Provider value={{
            user,
            isLoggedIn,
            setIsLoggedIn,
            fetchUserDetails,
            logout,
            person,
            setPerson,
            chatPerson,
            setChatPerson,
            socket,
            activeUsers,
            setActiveUsers,
            openChats,
            addToOpenChats,
            removeFromOpenChats
        }}>
            {children}
        </AccountContext.Provider>
    );
};

export default AccountProvider;
