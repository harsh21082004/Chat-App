import React from 'react'
import styles from '../../styles/Chat/OtherFiles.module.css'
import { useSelector } from 'react-redux';

const OtherFiles = ({ index, fileIndex, msg, firstInGroup, file, fileUrl, containsCaption }) => {

    const { user } = useSelector((state) => state.user);
    return (
        <div
            key={`read-${index}-file-${fileIndex}`}
            className={`
                  ${styles.message}
                  ${msg.senderId === user._id ? styles.right : styles.left}
                  ${styles.fileType}
                  ${firstInGroup ? styles.firstMessage : ''}
                `}
        >
            <div className={`${styles.chatFile} ${containsCaption ? styles.fileWithCaption : ''}`}>
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
                <p className={styles.messageContent} style={{ margin: '0 10px' }}>{file.filecaption}</p>
                <span className={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <i className={`fa-solid fa-check ${styles.singleTick}`}></i>
            </div>
        </div>
    )
}

export default OtherFiles