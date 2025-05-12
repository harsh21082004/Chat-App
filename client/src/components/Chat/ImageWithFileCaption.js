import React from 'react'
import styles from '../../styles/Chat/ImageWithFileCaption.module.css'
import { useSelector } from 'react-redux';

const ImageWithFileCaption = ({index, fileIndex, msg, file, toggleImageView, firstInGroup, fileUrl}) => {

    const { user } = useSelector((state) => state.user);

    return (
        <div
            key={`read-${index}-img-caption-${fileIndex}`}
            className={`
                  ${styles.message}
                  ${msg.senderId === user._id ? styles.right : styles.left}
                  ${styles.fileType}
                  ${firstInGroup ? styles.firstMessage : ''}
                `}
        >
            <div className={styles.chatImageWithCaption}>
                <img
                    src={fileUrl}
                    alt="media"
                    className={styles.chatImage}
                    onClick={() => toggleImageView(fileIndex, file)}
                />
                <p className={styles.messageContent} style={{ margin: '0 10px' }}>{file.filecaption}</p>
                <span className={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <i className={`fa-solid fa-check ${styles.singleTick}`}></i>
            </div>
        </div>
    )
}

export default ImageWithFileCaption