import React, { useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/Chat.module.css';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setNewMessage } from '../redux/slices/chatSlice';
import { addConversation } from '../redux/thunks/conversationThunk';

const Chat = () => {
  const dispatch = useDispatch();
  const { chatPerson, user } = useSelector((state) => state.user)
  const { newMeesage } = useSelector((state) => state.chat)
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);

  const scrollRef = useRef(null);

  const fetchMessages = async () => {
    // try {
    //   const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/chat/get-messages/${user?._id}/${chatPerson?._id}`);
    //   if (response.status !== 200) {
    //     console.error('Error fetching messages:', response);
    //     setMessages([]);
    //     return;
    //   }
    //   setMessages(prev => [...prev, ...response.data.messages]);

    // } catch (err) {
    //   console.error('Error fetching messages:', err);
    //   setMessages([]);
    //   console.log('Messages:', messages);
    // }
  };

  const fetchConversations = async () => {
    // try {
    //   const response = await axios.get(`${process.env.REACT_APP_BACKEND_BASE_URL}/api/conversation/get/${user?._id}`); // Ensure conversations contain `lastMessage`
    //   console.log(response)
    // } catch (err) {
    //   console.error('Error fetching conversations:', err);
    // }
  };

  // useEffect(() => {

  //   if (chatPerson?._id) {
  //     fetchMessages();
  //   }
  // }, [chatPerson, user, setMessages, newMessage]);

  // useEffect(() => {
  //   if (user?._id) {
  //     fetchConversations();
  //   }
  // }, [user, chatPerson, setChatPerson, newMessage]);

  // useEffect(() => {
  //   socket?.current?.on('getMessage', data => {
  //     setIncomingMessage({
  //       senderId: data.senderId,
  //       receiverId: data.receiverId,
  //       content: data.content,
  //       messageType: data.messageType,
  //       timestamp: Date.now()
  //     });
  //   });
  // }, [newMessage, chatPerson, socket, incomingMessage, messages]);

  // useEffect(() => {
  //   console.log('chat:', chatPerson?._id, incomingMessage?.senderId);
  //   if (incomingMessage && chatPerson?._id === incomingMessage?.senderId && user?._id === incomingMessage?.receiverId) {
  //     setMessages(prev => [...prev, incomingMessage]);

  //   }
  // }, [incomingMessage, chatPerson])

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message) return;
    try {
      dispatch(setNewMessage(message))
      const conversationData = {
        senderId: user?._id,
        receiverId: chatPerson?._id,
        lastMessage: message,
        lastMessageTimestamp: Date.now(),
      }
      const resultAction = await dispatch(addConversation(conversationData));
      if (addConversation.fulfilled.match(resultAction)) {
        console.log('Conversation added:', resultAction.payload);
        
      } else {
        console.error('Failed to add conversation:', resultAction.error.message);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setMessage('');
    }

  };

  // useEffect(() => {
  //   scrollRef.current?.scrollIntoView({ transition: 'smooth' });
  // }, [messages]);


  return (
    <>
      {Object.keys(chatPerson).length > 0 ? (
        <div className={`${styles.chat}`}>
          <div className={`${styles.header}`}>
            <div className={`${styles.headerInfo}`}>
              <div className={`${styles.profileImg}`}>
                <img src={chatPerson?.profilePhoto} alt="profile" />
              </div>
              <div className={`${styles.details}`}>
                <h3>{chatPerson?.name}</h3>
                {/* <p>{activeUsers?.find(user => user?._id === chatPerson._id) ? 'Online' : 'Offline'}</p> */}
              </div>
            </div>
            <div className={`${styles.headerRight}`}>
              <Link><i className="fa-solid fa-phone"></i></Link>
              <Link><i className="fa-solid fa-video"></i></Link>
              <Link><i className="fa-solid fa-ellipsis-vertical"></i></Link>
            </div>
          </div>

          <div className={`${styles.chatBody}`}>
            {messages?.map((msg, index) => (
              <div
                key={index}
                ref={index === messages.length - 1 ? scrollRef : null}
              // className={`${styles.message} ${msg.senderId === user?._id ? styles.right : styles.left} ${((index > 0 && messages[index - 1]?.senderId === msg.receiverId && msg.senderId === user?._id) || (index === 0 && msg.senderId === user?._id)) && styles.rightCorner} ${((index > 0 && messages[index - 1]?.receiverId === msg.senderId && msg.senderId !== user?._id) || (index === 0 && msg.senderId !== user?._id)) && styles.leftCorner}`}
              >
                <div>
                  <p className={styles.messageContent}>{msg.content}</p>
                  <span className={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={`${styles.footer}`}>
            <form onSubmit={handleSendMessage}>
              <div className={`${styles.input}`}>
                <input
                  type="text"
                  id="message"
                  placeholder="Type a message"
                  className={`${styles.text}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <input type="file" name="" id="file" className={`${styles.file}`} />
                <span>
                  <label htmlFor="file"><img src="/attach-file.png" alt="attach" /></label>
                </span>
                <div className={`${styles.footerIcons}`}>
                  <img src="/mic.png" alt="mic" />
                  <div className={`${styles.sep}`}></div>
                  <img src="/send.png" alt="send" onClick={handleSendMessage} />
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className={`${styles.chatImage}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <img src="/emptyChat.png" style={{ width: '500px', height: '500px' }} alt="cloud" />
          <h2 style={{ color: 'gray' }}>Open a chat to start messaging</h2>
        </div>
      )}
    </>
  );
};

export default Chat;
