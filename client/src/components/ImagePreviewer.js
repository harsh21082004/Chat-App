import React, { useState } from 'react';
import styles from '../styles/ImagePreviewer.module.css';

const ImagePreviewer = ({ files = [], onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const fileArray = Array.from(files);
    const [captions, setCaptions] = useState(fileArray.map(() => ''));


    const handleCaptionChange = (e) => {
        const updated = [...captions];
        updated[currentIndex] = e.target.value;
        setCaptions(updated);
    };

    return (
        <div className={styles.overlay}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <button className={styles.closeBtn} onClick={onClose}>✖</button>
                <div className={styles.actions}>
                    <i className="fa-regular fa-comment"></i>
                    <i className="fa-regular fa-star"></i>
                    <i className="fa-solid fa-thumbtack"></i>
                    <i className="fa-regular fa-face-smile"></i>
                    <i className="fa-solid fa-share"></i>
                    <i className="fa-solid fa-download"></i>
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                </div>
            </div>

            {/* Main Image */}
            <div className={styles.imageContainer}>
                <img
                    src={URL.createObjectURL(files[currentIndex])}
                    alt={`preview-${currentIndex}`}
                    className={styles.mainImage}
                />
            </div>

            {/* Caption */}
            <div className={styles.captionBar}>
                <input
                    type="text"
                    placeholder="Add a caption"
                    className={styles.captionInput}
                    value={captions[currentIndex]}
                    onChange={handleCaptionChange}
                />
            </div>

            {/* Thumbnails */}
            <div className={styles.thumbnailBar}>
                {fileArray.map((file, index) => (
                    <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`thumb-${index}`}
                        className={`${styles.thumbnail} ${index === currentIndex ? styles.active : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}

                <img
                    src={URL.createObjectURL(fileArray[currentIndex])}
                    alt={`preview-${currentIndex}`}
                    className={styles.mainImage}
                />
            </div>
        </div>
    );
};

export default ImagePreviewer;
