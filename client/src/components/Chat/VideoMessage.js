import React, { useState } from 'react'
import styles from '../../styles/Chat/TextOrVideoMessage.module.css';
import { useSelector } from 'react-redux';
import VideoSkeleton from './VideoSkeleton';
import PlayButton from '../Buttons/PlayButton';

const TextOrVideoMessage = ({ index, msg, videoFilesWithoutCaption, firstInGroup, readMessages, scrollRef, toggleVideoView, moreVideos }) => {

    const { user } = useSelector((state) => state.user);
    const [ isVideoLoading, setIsVideoLoading ] = useState(true);
    
    return (
        <div
            key={`read-${index}-text-image`}
            className={`
                ${styles.message}
                ${msg.senderId === user?._id ? styles.right : styles.left}
                ${videoFilesWithoutCaption.length > 0 ? styles.imageMessage : ''}
                ${firstInGroup ? styles.firstMessage : ''}
              `}
            ref={index === readMessages.length - 1 ? scrollRef : null}
        >
            <div className={`${styles.messageContainer}`}>

                {videoFilesWithoutCaption.length > 0 && (
                    <div className={`${styles.filesContent} ${styles[`files${videoFilesWithoutCaption.length >= 4 ? 'more' : videoFilesWithoutCaption.length}`]}`}>
                        {videoFilesWithoutCaption.slice(0, 4).map((file, i) => {
                            const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                            return (
                                <div key={i} className={styles.fileWrapper} onClick={() => toggleVideoView(i, file)}>
                                   <video src={fileUrl} onLoadedData={() => setIsVideoLoading(false)} className={styles.chatVideo} ></video>
                                   {isVideoLoading && (<VideoSkeleton />)}
                                   <PlayButton top={50} />
                                </div>
                            );
                        })}
                        {moreVideos > 0 && (
                            <span className={styles.moreVideos}>+{moreVideos}</span>
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

export default TextOrVideoMessage