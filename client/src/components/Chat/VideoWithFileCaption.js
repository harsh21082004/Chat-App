import React, { useState } from 'react'
import styles from '../../styles/Chat/VideoWithFileCaption.module.css'
import { useSelector } from 'react-redux';
import VideoSkeleton from './VideoSkeleton';
import PlayButton from '../Buttons/PlayButton';

const VideoWithFileCaption = ({ index, fileIndex, msg, file, toggleVideoView, firstInGroup, fileUrl }) => {

    const { user } = useSelector((state) => state.user);
    const [isVideoLoading, setIsVideoLoading] = useState(true);

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
            <div className={styles.chatVideoWithCaption} >
                <div onClick={() => toggleVideoView(index, file)}>
                    <video src={fileUrl} onLoadedData={() => setIsVideoLoading(false)} className={styles.chatVideo} ></video>
                    {isVideoLoading && (<VideoSkeleton />)}
                    <PlayButton top={40} />
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

export default VideoWithFileCaption