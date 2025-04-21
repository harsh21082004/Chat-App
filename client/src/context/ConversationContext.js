import React, { createContext, useState, useRef, useEffect } from 'react';

export const ConversationContext = createContext();

const ConversationProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [newMessage, setNewMessage] = useState([]);

    const addConversation = (newConversation) => {
        setConversations((prevConversations) => [...prevConversations, newConversation]);
    };

    return (
        <ConversationContext.Provider value={{
            newMessage,
            setNewMessage,
            conversations,
            addConversation,
            setConversations
        }}>
            {children}
        </ConversationContext.Provider>
    );
};

export default ConversationProvider;