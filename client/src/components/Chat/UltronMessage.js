import React from 'react';
import styles from '../../styles/Chat/UltronMessage.module.css'; // Reusing your existing styles
import { useSelector } from 'react-redux';
import MessageContent from './MessageContent'; // The markdown renderer we made

const UltronMessage = ({ index, msg, firstInGroup, readMessages, scrollRef }) => {

    const { user } = useSelector((state) => state.user);

    // Determine direction: User on Right (Blue), Ultron on Left (Dark)
    const isUser = msg.senderId === user?._id;

    return (
        <div
            key={`ultron-${index}`}
            className={`
                ${styles.message}
                ${isUser ? styles.right : styles.left}
                ${firstInGroup ? styles.firstMessage : ''} 
            `}
            ref={index === readMessages.length - 1 ? scrollRef : null}
        >
            <div className={`${styles.messageContainer}`}>

                {/* We use a DIV wrapper instead of P here because Markdown 
                   contains block elements (like code blocks & tables).
                   The 'messageContent' class ensures font-size matches your other chats.
                */}
                <div className={styles.messageContent}>
                    {isUser ? <p>{msg.content}</p> : <MessageContent content={msg.content} />}
                </div>

                <span className={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isUser && (
                        <i className={`fa-solid fa-check ${styles.singleTick}`}></i>
                    )}
                </span>

                {/* Only show ticks if the user sent the message */}
            </div>
        </div>
    );
};

export default UltronMessage;