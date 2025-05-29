import React from 'react'
import styles from '../../styles/Chat/AudioRecorder.module.css';


const AudioRecorder = ({ dataArray, iconRef, iconClass, isPaused, togglePauseRecording, handleSendMessage, formatTime, recordingTime, cancelRecording}) => {

    
    return (
        <div className={styles.voiceRecorder}>
            <i className={`fa-solid fa-trash ${styles.trash}`} onClick={cancelRecording}></i>
            <span style={{ position: 'static' }}>{formatTime(recordingTime)}</span>

            <div className={styles.waveform}>
                {dataArray.map((value, i) => (
                    <div
                        key={i}
                        className={styles.bar}
                        style={{
                            height: `${Math.max(value, 3)}px`,
                            width: '3px',
                            minHeight: '3px',
                            minWidth: '3px',
                            background: '#ccc',
                            borderRadius: '1.5px',
                        }}
                    />
                )).reverse()}
            </div>

            <i ref={iconRef} className={`${iconClass} ${isPaused ? styles.mic : styles.pause}`} onClick={togglePauseRecording}></i>

            <button
                type="button"
                onClick={(e) => {
                    handleSendMessage(e);         // Now send message
                }}
                className={styles.sendButton}
            >
                <img src="/send.png" alt="send" />
            </button>

        </div>
    )
}

export default AudioRecorder