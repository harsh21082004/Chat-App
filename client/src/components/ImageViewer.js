import React, { useMemo, useState } from 'react';
import styles from '../styles/ImageViewer.module.css';

const ImageViewer = ({ images = [], imageUrl = '', onClose, chatPerson }) => {
  const baseUrl = process.env.REACT_APP_BACKEND_BASE_URL;

  // Reorder images so clicked image is first
  const orderedImages = useMemo(() => {
    if (!imageUrl) return images;

    const index = images.findIndex(img => img.url === imageUrl);
    if (index === -1) return images;

    return [...images.slice(index), ...images.slice(0, index)];
  }, [images, imageUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = orderedImages[currentIndex];
  if (!currentImage) return null;

  const formatTime = (uploadedAt) => {
    const date = new Date(uploadedAt);
    const day = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day} at ${time}`;
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : orderedImages.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % orderedImages.length);
  };

  return (
    <div className={styles.viewerOverlay}>
      <div className={styles.topBar}>
        <div>
          <img src={baseUrl + chatPerson?.profilePhoto} alt="user" className={styles.avatar} />
          <div>
            <p>{chatPerson?.name}</p>
            <p className={styles.time}>{formatTime(currentImage.uploadedAt)}</p>
          </div>
        </div>
        <div className={styles.actions}>
          <i className="fa-regular fa-comment"></i>
          <i className="fa-regular fa-star"></i>
          <i className="fa-solid fa-thumbtack"></i>
          <i className="fa-regular fa-face-smile"></i>
          <i className="fa-solid fa-share"></i>
          <a href={baseUrl + currentImage.url} target="_blank" rel="noopener noreferrer" download className={styles.download}><i className="fa-solid fa-download"></i></a>
          <i className="fa-solid fa-ellipsis-vertical"></i>
          <i className="fa-solid fa-xmark" onClick={onClose}></i>
        </div>
      </div>

      <div className={styles.imageContainer}>
        <button className={styles.navLeft} onClick={handlePrev}>❮</button>
        <img
          src={baseUrl + currentImage.url}
          alt={`img-${currentIndex}`}
          className={styles.mainImage}
        />
        <button className={styles.navRight} onClick={handleNext}>❯</button>
      </div>

      <div className={styles.thumbnailBar}>
        {orderedImages.map((img, index) => (
          <img
            key={index}
            src={baseUrl + img.url}
            alt={`thumb-${index}`}
            className={`${styles.thumbnail} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageViewer;
