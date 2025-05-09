import React, { useEffect, useState } from 'react';
import styles from '../styles/Conversations.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { setChatPerson } from '../redux/slices/userSlice';
import { getConversations } from '../redux/thunks/conversationThunk';
import { toggleActivePage } from '../redux/slices/conversationSlice';
import { markAsSeen } from '../redux/thunks/chatThunks';

const Conversations = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const conversationState = useSelector((state) => state.conversation);

    const [receiverDetails, setReceiverDetails] = useState([]);
    const [lastMessage, setLastMessage] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');


    console.log(user)

    useEffect(() => {
        console.log('Fetching conversations...');
        // if (!conversationState.fetched) {
            console.log('Fetching conversations...');
            dispatch(getConversations(user?._id));
        // }
    }, [dispatch, conversationState.fetched, user]);


    const handleChatPerson = (receiver) => async () => {
        dispatch(setChatPerson(receiver));
    };

    const handleSeenMessage = (receiver) => async () => {
        if (!conversationState.conversations) return;
        const conversation = conversationState.conversations.find(convo => {
            return (
                (convo.senderId._id === user._id && convo.receiverId._id === receiver._id) ||
                (convo.receiverId._id === user._id && convo.senderId._id === receiver._id)
            )
        })

        console.log(conversation)
        const resultAction = await dispatch(markAsSeen(conversation._id));
        console.log(resultAction);

        if (markAsSeen.fulfilled.match(resultAction)) {
            console.log(resultAction.payload);
        }
    };

    return (
        <div className={styles.conversations}>
            <div className={styles.header}>
                <div className={styles.top}>
                    <div className={styles.left}>
                        <h2>Messages</h2>
                    </div>
                    <div className={styles.right} onClick={() => {
                        toggleActivePage('newChatModel')(dispatch);
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
                {[...conversationState?.conversations]
                    .sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp))
                    .filter((convo) => {
                        const term = searchTerm.toLowerCase();
                        const receiver = convo.senderId?._id === user?._id ? convo.receiverId : convo.senderId;

                        return (
                            receiver?.name?.toLowerCase().includes(term) ||
                            receiver?.email?.toLowerCase().includes(term) ||
                            receiver?.phone?.toLowerCase().includes(term)
                        );
                    })
                    .map((convo) => {
                        const isSender = convo.senderId._id === user._id;
                        const receiver = isSender ? convo.receiverId : convo.senderId;
                        const lastMessage = convo.lastMessage || 'No messages yet';
                        const time = convo.lastMessageTimestamp
                            ? new Date(convo.lastMessageTimestamp).toLocaleTimeString()
                            : '';

                        // Get unread count for current user from the seen object
                        const seenData = convo.seen;
                        let unreadCount = 0;

                        if (seenData?.sender?.userId === user._id.toString()) {
                            unreadCount = seenData.sender.unreadCount;
                        } else if (seenData?.receiver?.userId === user._id.toString()) {
                            unreadCount = seenData.receiver.unreadCount;
                        }

                        return (
                            <div
                                key={convo._id}
                                className={styles.conversation}
                                onClick={() => {
                                    handleChatPerson(receiver)();
                                    setSearchTerm('');
                                    handleSeenMessage(receiver)();
                                }}
                            >
                                <div className={styles.profile}>
                                    <img src={`${process.env.REACT_APP_BACKEND_BASE_URL + receiver?.profilePhoto}`} alt="profile" />
                                    <div className={styles.details}>
                                        <h3>
                                            {receiver._id === user._id ? `${receiver.name} (You)` : receiver.name}
                                        </h3>
                                        <p>{lastMessage}</p>
                                    </div>
                                </div>
                                <div className={styles.time}>
                                    <p className={styles.lastMessage}>{time}</p>
                                    {unreadCount > 0 && (
                                        <span className={styles.unreadCount}>{unreadCount}</span>
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
