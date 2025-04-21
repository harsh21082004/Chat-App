// NewChatContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios'; // Ensure axios is installed

export const NewChatContext = createContext();

const NewChatContextProvider = ({ children }) => {
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/users`); // Adjust the endpoint as necessary
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleNewChatModal = () => {
        setIsNewChatModalOpen(!isNewChatModalOpen);
    };

    return (
        <NewChatContext.Provider value={{ isNewChatModalOpen, toggleNewChatModal, users }}>
            {children}
        </NewChatContext.Provider>
    );
};

export default NewChatContextProvider;
