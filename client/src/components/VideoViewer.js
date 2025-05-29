import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/VideoViewer.module.css';
import VideoSkeleton from './Chat/VideoSkeleton';

const VideoViewer = ({ videos = [], videoUrl = '', onClose, chatPerson }) => {
  const baseUrl = process.env.REACT_APP_BACKEND_BASE_URL;
  const videoRef = useRef(null);

  const orderedVideos = useMemo(() => {
    if (!videoUrl) return videos;
    const index = videos.findIndex(vid => vid.url === videoUrl);
    if (index === -1) return videos;
    return [...videos.slice(index), ...videos.slice(0, index)];
  }, [videos, videoUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  const seekRef = useRef(null);
  const volumeRef = useRef(null);



  const currentVideo = orderedVideos[currentIndex];

  const updateSeekBarBackground = () => {
    if (!seekRef.current || !duration) return;

    const value = (currentTime / duration) * 100;
    seekRef.current.style.background = `linear-gradient(to right, #ffffff ${value}%, #444444 ${value}%)`;
  };

  const updateVolumeBarBackground = () => {
    if (!volumeRef.current) return;
    const value = volume * 100; // convert to percentage
    volumeRef.current.style.background = `linear-gradient(to right, #ffffff ${value}%, #444444 ${value}%)`;
  };


  useEffect(() => {
    updateSeekBarBackground();
  }, [currentTime, duration]);

  const handleVolume = (e) => {
    const vol = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.volume = vol;
    setVolume(vol);
    updateVolumeBarBackground(); // ⬅️ call it here too
  };


  useEffect(() => {
    updateVolumeBarBackground();
  }, [volume]);


  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = newTime;
  };

  const handlePrev = () => setCurrentIndex(prev => (prev > 0 ? prev - 1 : orderedVideos.length - 1));
  const handleNext = () => setCurrentIndex(prev => (prev + 1) % orderedVideos.length);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    video.volume = volume;
    video.play().then(() => setIsPlaying(true)).catch(() => { });
    setCurrentTime(0);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [currentIndex]);

  const formatTime = (time) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (!currentVideo) return null;


  return (
    <div className={styles.viewerOverlay}>
      <div className={styles.topBar}>
        <div>
          <img src={baseUrl + chatPerson?.profilePhoto} alt="user" className={styles.avatar} />
          <div>
            <p>{chatPerson?.name}</p>
            <p className={styles.time}>{new Date(currentVideo.uploadedAt).toLocaleString()}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <i className="fa-regular fa-comment"></i>
          <i className="fa-regular fa-star"></i>
          <i className="fa-solid fa-thumbtack"></i>
          <i className="fa-regular fa-face-smile"></i>
          <i className="fa-solid fa-share"></i>
          <a href={baseUrl + currentVideo.url} target="_blank" rel="noopener noreferrer" download className={styles.download}><i className="fa-solid fa-download"></i></a>
          <i className="fa-solid fa-ellipsis-vertical"></i>
          <i className="fa-solid fa-xmark" onClick={onClose}></i>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <button className={styles.navLeft} onClick={handlePrev}>❮</button>

        <div className={styles.videoWrapper}>
          <video
            ref={videoRef}
            src={baseUrl + currentVideo.url}
            className={styles.mainImage}
            controls={false}
            onLoadedData={() => setIsVideoLoading(false)}
          />

          {isVideoLoading && <VideoSkeleton />}

          <div className={styles.controls}>
            {isPlaying ? <i className="fa-solid fa-pause" style={{ fontSize: '20px' }} onClick={handlePlayPause}></i> : <i onClick={handlePlayPause} style={{ fontSize: '20px' }} className="fa-solid fa-play"></i>}

            <span>{formatTime(currentTime)}</span>

            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onInput={handleSeek}
              className={styles.seekBar}
              ref={seekRef}
            />

            <span>{formatTime(duration)}</span>

            <i className={`fa-solid fa-volume-high ${styles.volumeIcon}`} >
            </i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolume}
              className={styles.volumeBar}
              ref={volumeRef}
            />
          </div>
        </div>

        <button className={styles.navRight} onClick={handleNext}>❯</button>
      </div>

      <div className={styles.thumbnailBar}>
        {orderedVideos.map((vid, index) => (
          <video
            key={index}
            src={baseUrl + vid.url}
            className={`${styles.thumbnail} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => setCurrentIndex(index)}
            muted
          />
        ))}
      </div>
    </div>
  );
};

export default VideoViewer;
