import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import styles from '../../styles/Chat/AudioPlayer.module.css';
import { useSelector } from 'react-redux';

const AudioPlayer = ({ audioUrl, msg, firstInGroup, index, fileIndex, file, containsCaption }) => {
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const cursorRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { user, chatPerson } = useSelector((state) => state.user);

    useEffect(() => {
        if (!audioUrl) return;

        const wave = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#828282',
            progressColor: '#ffffff',
            height: 45,
            barWidth: 4,
            responsive: true,
            cursorWidth: 0,
            barGap: 2,
            barRadius: 2,
        });

        wave.load(audioUrl);

        // Cursor update on playback
        wave.on('audioprocess', () => {
            if (!cursorRef.current || !waveformRef.current) return;
            const duration = wave.getDuration();
            const currentTime = wave.getCurrentTime();
            const progress = currentTime / duration;
            const waveformWidth = waveformRef.current.clientWidth;
            const cursorX = waveformWidth * progress;
            cursorRef.current.style.transform = `translateX(${cursorX}px)`;
        });

        wave.on('finish', () => setIsPlaying(false));

        // Click-to-seek
        const handleClick = (e) => {
            const bounds = waveformRef.current.getBoundingClientRect();
            const x = e.clientX - bounds.left;
            const width = bounds.width;
            const progress = x / width;
            wave.seekTo(progress);
        };

        waveformRef.current.addEventListener('click', handleClick);

        // Drag-to-seek support
        let isDragging = false;

        const handleMouseDown = (e) => {
            isDragging = true;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        const handleMouseMove = (e) => {
            if (!isDragging || !wavesurfer.current || !waveformRef.current || !cursorRef.current) return;

            const bounds = waveformRef.current.getBoundingClientRect();
            const x = Math.max(0, Math.min(e.clientX - bounds.left, bounds.width));
            const progress = x / bounds.width;

            // Set custom cursor position manually
            cursorRef.current.style.transform = `translateX(${x}px)`;

            // Defer seek slightly if audio isn't ready
            const wave = wavesurfer.current;
            if (wave.isReady) {
                wave.seekTo(progress);
            } else {
                wave.once('ready', () => {
                    wave.seekTo(progress);
                });
            }
        };



        const handleMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        if (cursorRef.current) {
            cursorRef.current.addEventListener('mousedown', handleMouseDown);
        }

        wavesurfer.current = wave;

        // return () => {
        //     console.log(wave)
        //     wave.destroy();
        //     if (waveformRef.current) {
        //         waveformRef.current.removeEventListener('click', handleClick);
        //     }

        //     if (cursorRef.current) {
        //         cursorRef.current.removeEventListener('mousedown', handleMouseDown);
        //     }

        //     document.removeEventListener('mousemove', handleMouseMove);
        //     document.removeEventListener('mouseup', handleMouseUp);
        // };

    }, [audioUrl]);

    const togglePlayback = () => {
        const wave = wavesurfer.current;
        if (!wave) return;

        if (!isPlaying) {
            // If just starting, ensure currentTime is honored
            const time = wave.getCurrentTime();
            if (time > 0) wave.play(time);
            else wave.play();
        } else {
            wave.pause();
        }

        setIsPlaying(!isPlaying);
    };


    const baseUrl = process.env.REACT_APP_BACKEND_BASE_URL;

    return (
        <div>
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
                            <div className={styles.profileImage}>
                                <img src={msg.senderId === user._id ? baseUrl + user?.profilePhoto : baseUrl + chatPerson?.profilePhoto} alt='profile' />
                            </div>
                            <div className={styles.aboutFile}>
                                <i onClick={togglePlayback} className={`${isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'}`}></i>
                                <div className={styles.relative}>
                                    <div ref={waveformRef} className={styles.waveform} />
                                    <div ref={cursorRef} className={styles.cursor} />
                                </div>
                            </div>
                        </div>
                        <a href={audioUrl} target="_blank" rel="noopener noreferrer" download>
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
        </div>
    );
};

export default AudioPlayer;
