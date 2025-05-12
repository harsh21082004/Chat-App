import React from 'react'
import styles from '../../styles/Chat/TextOrImageMessage.module.css';
import { useSelector } from 'react-redux';

const TextOrImageMessage = ({ index, msg, imageFilesWithoutCaption, firstInGroup, readMessages, scrollRef, isText, toggleImageView, moreImages }) => {

    const { user } = useSelector((state) => state.user);
    
    return (
        <div
            key={`read-${index}-text-image`}
            className={`
                ${styles.message}
                ${msg.senderId === user?._id ? styles.right : styles.left}
                ${imageFilesWithoutCaption.length > 0 ? styles.imageMessage : ''}
                ${firstInGroup ? styles.firstMessage : ''}
              `}
            ref={index === readMessages.length - 1 ? scrollRef : null}
        >
            <div className={`${styles.messageContainer}`}>
                {isText && <p className={styles.messageContent}>{msg.content}</p>}

                {imageFilesWithoutCaption.length > 0 && (
                    <div className={`${styles.filesContent} ${styles[`files${imageFilesWithoutCaption.length >= 4 ? 'more' : imageFilesWithoutCaption.length}`]}`}>
                        {imageFilesWithoutCaption.slice(0, 4).map((file, i) => {
                            const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                            return (
                                <div key={i} className={styles.fileWrapper} onClick={() => toggleImageView(i, file)}>
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
    )
}

export default TextOrImageMessage