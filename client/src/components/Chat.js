import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../styles/Chat.module.css';
import { Link } from 'react-router-dom';
import { setNewMessage, setMessages } from '../redux/slices/chatSlice';
import { addConversation, getConversations } from '../redux/thunks/conversationThunk';
import { sendMessage, getMessages } from '../redux/thunks/chatThunks';
import ImageViewer from './ImageViewer';
import FilePreviewer from './FilePreviewer';
import TextOrImageMessage from './Chat/TextOrImageMessage';
import ImageWithFileCaption from './Chat/ImageWithFileCaption';
import OtherFiles from './Chat/OtherFiles';

const Chat = () => {
  const dispatch = useDispatch();
  const { chatPerson, user } = useSelector((state) => state.user);
  const chatState = useSelector((state) => state.chat);
  const conversationState = useSelector((state) => state.conversation);

  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // ✅ Defined
  const [isImageOpened, setIsImageOpened] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const scrollRef = useRef(null);
  const newMessageLabelRef = useRef(null);
  const chatContainerRef = useRef(null);

  const textRef = useRef(null);



  useEffect(() => {
    const el = textRef.current;
    if (el) {
      el.style.height = "50px"; // Reset to 1 line
      const scrollHeight = el.scrollHeight;
      el.style.height = `${Math.min(scrollHeight, 120)}px`; // Cap at ~5 lines
    }
  }, [message]);

  const toggleImageView = (imageIndex, file) => {
    console.log(imageIndex, file)
    setImageUrl(file?.url);
    setImageIndex(imageIndex);
    setIsImageOpened(!isImageOpened);
  };




  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatPerson?._id || !user?._id) return;

      try {
        let conversation = conversationState.conversations.find(convo => {
          return (
            (convo.senderId._id === user._id && convo.receiverId._id === chatPerson._id) ||
            (convo.receiverId._id === user._id && convo.senderId._id === chatPerson._id)
          );
        });

        if (!conversation) return;

        const result = await dispatch(getMessages(conversation._id));

        if (getMessages.fulfilled.match(result)) {
          const messages = result.payload.messages;
          if (conversation.seen?.receiver?.userId === user._id) {
            setUnreadCount(conversation.seen.receiver.unreadCount);
          } else {
            setUnreadCount(0); // Sender should not see unread count
          }

          dispatch(setMessages({ messages, conversationId: conversation._id }));
        } else {
          console.error('Failed to load messages:', result.error.message);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [chatPerson, user, dispatch, conversationState.conversations, unreadCount]);

  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const newLabel = newMessageLabelRef.current;

      if (unreadCount > 0 && newLabel) {
        const labelOffsetTop = newLabel.offsetTop;
        const containerHeight = container.clientHeight;

        // Scroll so that the "New Messages" label appears at the bottom
        container.scrollTop = labelOffsetTop - containerHeight + newLabel.clientHeight;
      } else {
        // No unread messages, scroll to bottom
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [chatState.messages, unreadCount]);



  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message && !file) return;

    try {
      dispatch(setNewMessage(message));

      const conversationData = {
        senderId: user._id,
        receiverId: chatPerson._id,
        lastMessage: file ? 'Sent a file' : message,
        lastMessageTimestamp: Date.now(),
      };

      const convoResult = await dispatch(addConversation(conversationData));
      if (addConversation.fulfilled.match(convoResult)) {
        const conversationId = convoResult.payload.conversation._id;
        await dispatch(getConversations(user._id));

        let msgPayload = new FormData();

        if (file) {
          for (let i = 0; i < file.length; i++) {
            msgPayload.append('files', file[i]);
          }
          msgPayload.append('conversationId', conversationId);
          msgPayload.append('senderId', user._id);
          msgPayload.append('receiverId', chatPerson._id);
          msgPayload.append('messageType', 'file');
        } else {
          msgPayload.append('content', message);
          msgPayload.append('conversationId', conversationId);
          msgPayload.append('senderId', user._id);
          msgPayload.append('receiverId', chatPerson._id);
          msgPayload.append('messageType', 'text');
        }

        const msgResult = await dispatch(sendMessage(msgPayload));

        if (sendMessage.fulfilled.match(msgResult)) {
          console.log('Message sent:', msgResult.payload);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setMessage('');
      setFile(null);
    }
  };

  const isFirstInGroup = (messages, index) => {
    if (index === 0) return true;
    return messages[index].senderId !== messages[index - 1].senderId;
  };


  const messages = chatState.messages || [];
  const readMessages = messages.slice(0, messages.length - unreadCount);
  const unreadMessages = messages.slice(messages.length - unreadCount);

  console.log(messages)




  const allImageFiles = messages.flatMap(msg =>
    msg.files.map(file => ({
      ...file,
      timestamp: msg.timestamp,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
    }))
  );

  const imageMessages = allImageFiles.filter(
    (msg) =>
      msg.fileType.startsWith('image/')
  );


  return (
    <>
      {chatPerson?._id ? (
        <div className={styles.chat}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.profileImg}>
                <img src={`${process.env.REACT_APP_BACKEND_BASE_URL + chatPerson?.profilePhoto}`} alt="profile" />
              </div>
              <div className={styles.details}>
                <h3>{chatPerson?.name}</h3>
              </div>
            </div>
            <div className={styles.headerRight}>
              <Link><i className="fa-solid fa-phone"></i></Link>
              <Link><i className="fa-solid fa-video"></i></Link>
              <Link><i className="fa-solid fa-ellipsis-vertical"></i></Link>
            </div>
          </div>

          <div className={styles.chatBody} ref={chatContainerRef}>
            {readMessages.map((msg, index) => {
              const firstInGroup = isFirstInGroup(readMessages, index);
              const isText = msg.messageType === 'text';
              const hasFiles = msg.files?.length > 0;

              const imageFiles = msg.files?.filter(file => file.fileType.startsWith('image/')) || [];
              const otherFiles = msg.files?.filter(file => !file.fileType.startsWith('image/')) || [];

              const imageFilesWithCaption = imageFiles.filter(file => file.filecaption?.trim() !== '');
              const imageFilesWithoutCaption = imageFiles.filter(file => !file.filecaption?.trim());

              const moreImages = imageFilesWithoutCaption.length - 4;

              return (
                <>
                  {/* Text or Image Grid (if no captions) */}
                  {(isText || imageFiles.filter(file => file.filecaption === '').length > 0) && (
                    <TextOrImageMessage index={index} msg={msg} imageFilesWithoutCaption={imageFilesWithoutCaption} moreImages={moreImages} firstInGroup={firstInGroup} isText={isText} readMessages={readMessages} scrollRef={scrollRef} toggleImageView={toggleImageView} />
                  )}

                  {/* Images with Captions (rendered separately) */}
                  {imageFilesWithCaption.length > 0 && imageFilesWithCaption.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    return (
                      <ImageWithFileCaption index={index} fileIndex={fileIndex} file={file} fileUrl={fileUrl} firstInGroup={firstInGroup} toggleImageView={toggleImageView} msg={msg} />
                    )
                  })}

                  {/* Other file types */}
                  {otherFiles.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    const containsCaption = file.filecaption?.trim() !== '';
                    return (
                      <OtherFiles index={index} fileIndex={fileIndex} file={file} fileUrl={fileUrl} containsCaption={containsCaption} firstInGroup={firstInGroup} msg={msg} />
                    );
                  })}
                </>
              );
            })}


            {unreadMessages.map((msg, index) => {
              const firstInGroup = isFirstInGroup(readMessages, index);
              const isText = msg.messageType === 'text';
              const hasFiles = msg.files?.length > 0;

              const imageFiles = msg.files?.filter(file => file.fileType.startsWith('image/')) || [];
              const otherFiles = msg.files?.filter(file => !file.fileType.startsWith('image/')) || [];

              const moreImages = imageFiles.length - 4;

              return (
                <>
                  {/* Text or Image Message Bubble */}
                  {(isText || imageFiles.length > 0) && (
                    <div
                      key={`read-${index}-text-image`}
                      className={`
            ${styles.message}
            ${msg.senderId === user._id ? styles.right : styles.left}
            ${imageFiles.length > 0 ? styles.imageMessage : ''}
            ${firstInGroup ? styles.firstMessage : ''}
          `}
                      ref={index === readMessages.length - 1 ? scrollRef : null}
                    >
                      <div className={`${styles.messageContainer}`}>
                        {isText && <p className={styles.messageContent}>{msg.content}</p>}

                        {imageFiles.length > 0 && (
                          <div className={`${styles.filesContent} ${styles[`files${imageFiles.length >= 4 ? 4 : imageFiles.length}`]}`}>
                            {imageFiles.slice(0, 4).map((file, i) => {
                              const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                              return (
                                <div key={i} className={styles.fileWrapper}>
                                  <img src={fileUrl} alt="media" className={styles.chatImage} />
                                </div>
                              );
                            })}
                            {moreImages > 0 && (
                              <span className={styles.moreImages}>+{moreImages}</span>
                            )}
                          </div>
                        )}

                        <span className={styles.timestamp}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <i className={`fa-solid fa-check ${styles.singleTick}`}></i>
                      </div>
                    </div>
                  )}

                  {/* Separate Message Bubbles for Each File */}
                  {otherFiles.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    return (
                      <div
                        key={`read-${index}-file-${fileIndex}`}
                        className={`
              ${styles.message}
              ${msg.senderId === user._id ? styles.right : styles.left}
              ${styles.fileType}
            `}
                      >
                        <div className={styles.chatFile}>
                          <div className={styles.fileDetails}>
                            <div className={`${styles.fileLeft}`}>
                              <i className="fa-solid fa-file" style={{ fontSize: '20px', marginRight: '8px' }}></i>
                              <div className={styles.aboutFile}>
                                <p className={styles.filename}>{file.filename.split('-')[2]}</p>
                                <p className={styles.fileSize}>{(file.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" download>
                              <i className="fa-solid fa-download" style={{ marginLeft: 'auto' }}></i>
                            </a>
                          </div>
                        </div>
                        <span className={styles.timestamp}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <i className={`fa-solid fa-check ${styles.singleTick}`}></i>
                      </div>
                    );
                  })}
                </>
              );
            })}

          </div>

          <div className={styles.footer}>
            <form onSubmit={handleSendMessage}>
              <div className={styles.input}>
                <label className={styles.attachFile} htmlFor="file"><img src="/attach-file.png" alt="attach" /></label>
                <textarea
                  ref={textRef}
                  placeholder="Type a message"
                  className={styles.text}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // prevent newline
                      handleSendMessage(e); // send message
                    }
                  }}
                />

                <input
                  type="file"
                  id="file"
                  className={styles.file}
                  onChange={(e) => {
                    setFile(e.target.files)
                    setShowPreview(true);
                  }}
                  multiple
                />
                <div className={styles.footerIcons}>
                  <img src="/mic.png" alt="mic" />
                  <div className={styles.sep}></div>
                  <button type="submit" className={styles.sendButton}>
                    <img src="/send.png" alt="send" />
                  </button>
                </div>
              </div>
            </form>
          </div>
          {showPreview && <FilePreviewer files={file} onClose={() => {
            setFile(null);
            setShowPreview(false)
          }} />}
        </div>
      ) : (
        <div className={styles.emptyChat}>
          <img src="/emptyChat.png" alt="cloud" style={{ width: '500px', height: '500px' }} />
          <h2 style={{ color: 'gray' }}>Open a chat to start messaging</h2>
        </div>
      )}
      {isImageOpened && (
        <ImageViewer images={imageMessages} imageUrl={imageUrl} onClose={toggleImageView} chatPerson={chatPerson} />
      )}

    </>
  );
};

export default Chat;
