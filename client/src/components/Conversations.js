import React, { useContext, useEffect, useState } from 'react';
import styles from '../styles/Conversations.module.css';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setActivePage } from '../redux/slices/chatSlice';
import { toggleActivePage } from '../redux/thunks/chatThunks';
import { setChatPerson } from '../redux/slices/userSlice';
// import { NewChatContext } from '../context/NewChatContext';
// import { AccountContext } from '../context/AccountContext';
// import { ConversationContext } from '../context/ConversationContext';
// import { useOpenContext } from '../context/OpenContext';

const Conversations = () => {
    const dispatch = useDispatch();
    const { activePage } = useSelector((state) => state.chat);
    // const { isConversationOpen, handleOpenChat, handleOpenConversation, isChatOpen } = useOpenContext();
    // const { toggleNewChatModal } = useContext(NewChatContext);
    // const {
    //     user,
    //     setChatPerson,
    //     socket,
    //     setActiveUsers,
    //     addToOpenChats,
    //     openChats
    // } = useContext(AccountContext);

    const [conversations, setConversations] = useState([]);
    const [receiverDetails, setReceiverDetails] = useState([]);
    const [lastMessage, setLastMessage] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    // const { messages, newMessage, setNewMessage } = useContext(ConversationContext);

    // useEffect(() => {
    //     socket?.current?.emit('addUsers', user);
    //     socket?.current?.on('getUsers', users => setActiveUsers(users));
    // }, [user]);

    const fetchConversation = async () => {
    //     try {
    //         const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/get/${user._id}`);
    //         const data = response.data;

    //         const sorted = data.sort((a, b) => {
    //             const timeA = a.members[0].receiverIds[0]?.lastMessageTimestamp;
    //             const timeB = b.members[0].receiverIds[0]?.lastMessageTimestamp;
    //             return new Date(timeB) - new Date(timeA);
    //         });

    //         setConversations(sorted);

    //         const allReceiverMessages = [];
    //         const receiverIdSet = new Set();
    //         const receiverInfoMap = new Map();

    //         sorted.forEach(convo => {
    //             const receiverIds = convo.members[0].receiverIds;
    //             receiverIds.forEach(entry => {
    //                 allReceiverMessages.push(entry);
    //                 receiverIdSet.add(entry.receiverId);
    //             });
    //         });

    //         setLastMessage(allReceiverMessages);

    //         const receiverPromises = Array.from(receiverIdSet).map(id =>
    //             axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/auth/usersDetails/${id}`)
    //         );

    //         const receiverResponses = await Promise.all(receiverPromises);
    //         const receivers = receiverResponses.map(res => res.data);

    //         setReceiverDetails(receivers);
    //     } catch (error) {
    //         console.error('Error fetching conversation:', error);
    //     }
    };

    // useEffect(() => {
    //     fetchConversation();
    // }, [user, newMessage]);

    // useEffect(() => {
    //     const currentSocket = socket?.current;
    //     currentSocket?.on('getMessage', () => fetchConversation());
    //     currentSocket?.on('refreshConversation', () => fetchConversation());

    //     return () => {
    //         currentSocket?.off('getMessage');
    //         currentSocket?.off('refreshConversation');
    //     };
    // }, [socket]);

    const handleChatPerson = (receiver) => async () => {
    //     socket?.current?.emit('openChat', {
    //         userId: user._id,
    //         chatWithId: receiver._id
    //     });

    //     socket?.current?.emit('addChatPersons', {
    //         receiver,
    //         sender: user
    //     });

        dispatch(setChatPerson(receiver));
    //     addToOpenChats(receiver); // 🟢 Add receiver to openChats array

    //     const convo = conversations.find(c => 
    //         c.members[0].receiverIds.some(r => r.receiverId === receiver._id)
    //     );

    //     const conversationId = convo?._id;

    //     try {
    //         await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/create-chat/`, {
    //             senderId: user._id,
    //             receiverId: receiver._id,
    //             conversationId
    //         });
    //     } catch (error) {
    //         console.error('Error creating chat:', error);
    //     }
    };

    const handleSeenMessage = (receiver) => async () => {
        // try {
        //     await axios.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/mark-as-seen/`, {
        //         senderId: receiver._id,
        //         receiverId: user._id
        //     });
        // } catch (error) {
        //     console.error('Error marking message as seen:', error);
        // }
    };

    const filteredReceivers = receiverDetails.filter(receiver =>
        receiver.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.conversations}>
            <div className={styles.header}>
                <div className={styles.top}>
                    <div className={styles.left}>
                        <h2>Messages</h2>
                    </div>
                    <div className={styles.right} onClick={() => {
                        toggleActivePage('newChatModel')(dispatch);
                        fetchConversation();
                    }}>
                        <i className='fa-solid fa-plus'></i>
                        <i className='fa-regular fa-message'></i>
                    </div>
                </div>
                <form className={styles.bottom} onSubmit={e => e.preventDefault()}>
                    <div className={styles.input}>
                        <input
                            type="text"
                            id="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search"
                        />
                        <span><label htmlFor="search"><img src="/search.png" alt="search" /></label></span>
                    </div>
                </form>
            </div>

            <div className={styles.body}>
                {filteredReceivers.map((receiver, index) => {
                    const message = lastMessage.find(msg => msg.receiverId === receiver._id);
                    const unreadCount = message?.unreadCount;
                    const seen = message?.seen;

                    return (
                        <div key={index} className={`${styles.conversation}`} onClick={() => {
                            handleChatPerson(receiver)();
                            setSearchTerm('');
                            handleSeenMessage(receiver)();
                            // handleOpenChat();
                        }}>
                            <div className={styles.profile}>
                                <img src={receiver.profilePhoto} alt="profile" />
                                <div className={styles.details}>
                                    {/* <h3>{receiver._id === user._id ? `${receiver.name} (You)` : receiver.name}</h3> */}
                                    <p>{message?.lastMessage || 'No messages yet'}</p>
                                </div>
                            </div>
                            <div className={styles.time}>
                                <p className={styles.lastMessage}>
                                    {message?.lastMessageTimestamp ? new Date(message.lastMessageTimestamp).toLocaleTimeString() : ''}
                                </p>
                                {unreadCount > 0 && !seen && (
                                    <p className={styles.unreadCount}>{unreadCount}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Conversations;
