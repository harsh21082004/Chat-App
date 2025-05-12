import React, { useRef, useState } from 'react';
import styles from '../styles/FilePreviewer.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { addConversation, getConversations } from '../redux/thunks/conversationThunk';
import { sendMessage } from '../redux/thunks/chatThunks';
import { Cropper } from 'react-cropper';
import 'cropperjs/dist/cropper.css';

const FilePreviewer = ({ files = [], onClose }) => {
    const [fileArray, setFileArray] = useState(Array.from(files));
    const [croppedImages, setCroppedImages] = useState(fileArray.map(() => null));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCropper, setShowCropper] = useState(false);
    const [captions, setCaptions] = useState(fileArray.map(() => ''));
    const dispatch = useDispatch();
    const { chatPerson, user } = useSelector((state) => state.user);

    const fileInputRef = useRef(null);
    const cropperRef = useRef(null);

    const handleCaptionChange = (e) => {
        const updated = [...captions];
        updated[currentIndex] = e.target.value;
        setCaptions(updated);
    };

    const handleAddFiles = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length > 0) {
            setFileArray(prev => [...prev, ...newFiles]);
            setCaptions(prev => [...prev, ...newFiles.map(() => '')]);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!fileArray.length) return;

        try {
            const conversationData = {
                senderId: user?._id,
                receiverId: chatPerson?._id,
                lastMessage: 'Sent a file',
                lastMessageTimestamp: Date.now(),
            };

            const convoResult = await dispatch(addConversation(conversationData));
            if (!addConversation.fulfilled.match(convoResult)) return;

            const conversationId = convoResult.payload.conversation._id;
            await dispatch(getConversations(user._id));

            const formData = new FormData();
            formData.append('conversationId', conversationId);
            formData.append('senderId', user._id);
            formData.append('receiverId', chatPerson._id);
            formData.append('messageType', 'file');

            fileArray.forEach((file, index) => {
                formData.append('files', file);
                formData.append(`caption[${index}]`, captions[index] || '');
            });

            const msgResult = await dispatch(sendMessage(formData));
            if (sendMessage.fulfilled.match(msgResult)) {
                onClose();
            }
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const containFiles = fileArray.some(file => !file.type.startsWith('image/'));

    const applyCrop = () => {
        if (cropperRef.current) {
            const cropper = cropperRef.current.cropper;
            cropper.getCroppedCanvas().toBlob(blob => {
                const file = fileArray[currentIndex];
                const croppedFile = new File([blob], file.name, { type: blob.type });

                const updatedFiles = [...fileArray];
                updatedFiles[currentIndex] = croppedFile;
                setFileArray(updatedFiles);

                const updatedCropped = [...croppedImages];
                updatedCropped[currentIndex] = URL.createObjectURL(croppedFile);
                setCroppedImages(updatedCropped);

                setShowCropper(false);
            });
        }
    };

    return (
        <div className={styles.overlay}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <button className={styles.closeBtn} onClick={onClose}>✖</button>
                {containFiles ? (
                    <p>{fileArray[currentIndex].name}</p>
                ) : (
                    <div className={styles.actions}>
                        <i className="fa-solid fa-crop-simple" onClick={() => setShowCropper(!showCropper)}></i>
                        <i><img src="/circles-overlap.svg" alt="circles-overlap" /></i>
                        <i className="fa-solid fa-pen"></i>
                        <i className="fa-solid fa-t"></i>
                        <i className="fa-regular fa-face-smile"></i>
                    </div>
                )}
                <div className={styles.download} style={{ opacity: containFiles ? 0 : 1 }}>
                    <i className="fa-solid fa-download"></i>
                </div>
            </div>

            {/* Main Image */}
            {containFiles ? (
                <div className={styles.fileContainer}>
                    <i className="fa-solid fa-file"></i>
                    <div className={styles.fileDetails}>
                        <p>{(fileArray[currentIndex].size / (1024 * 1024)).toFixed(2)} MB</p>
                        <span>-</span>
                        <p>{fileArray[currentIndex].name.split('.').at(-1).toUpperCase()}</p>
                    </div>
                </div>
            ) : (
                <div className={styles.imageContainer}>
                    {showCropper ? (
                        <div className={styles.cropperContainer}>
                            <Cropper
                                src={URL.createObjectURL(fileArray[currentIndex])}
                                initialAspectRatio={NaN} 
                                guides={true}
                                viewMode={1}
                                dragMode="move"
                                cropBoxResizable={true}
                                cropBoxMovable={true}
                                responsive={true}
                                ref={cropperRef}
                                className={`${styles.cropper}`}
                            />
                            <button onClick={applyCrop} className={styles.cropButton}>Apply Crop</button>
                        </div>
                    ) : (
                        <img
                            src={croppedImages[currentIndex] || URL.createObjectURL(fileArray[currentIndex])}
                            alt={`preview-${currentIndex}`}
                            className={styles.mainImage}
                        />
                    )}
                </div>
            )}

            {/* Caption */}
            <div className={styles.captionBar}>
                <input
                    type="text"
                    placeholder="Add a caption"
                    className={styles.captionInput}
                    value={captions[currentIndex]}
                    onChange={handleCaptionChange}
                />
                <button type="submit" className={styles.sendButton} onClick={handleSendMessage}>
                    <img src="/send.png" alt="send" />
                </button>
            </div>

            {/* Thumbnails */}
            <div className={styles.thumbnailBar}>
                {fileArray.map((file, index) => {
                    const previewUrl = croppedImages[index] || URL.createObjectURL(file);
                    return (
                        <div
                            key={index}
                            className={`${styles.thumbnailFile} ${index === currentIndex ? styles.active : ''}`}
                            onClick={() => {
                                setCurrentIndex(index);
                                setShowCropper(false);
                            }}
                        >
                            {file.type.startsWith('image/') ? (
                                <img src={previewUrl} alt={`thumb-${index}`} className={styles.thumbnail} />
                            ) : (
                                <i className="fa-solid fa-file"></i>
                            )}
                        </div>
                    );
                })}
                <div className={styles.plusIcon} onClick={triggerFileInput}>
                    <i className="fa-solid fa-plus"></i>
                </div>
                <input type="file" multiple hidden ref={fileInputRef} onChange={handleAddFiles} />
            </div>
        </div>
    );
};

export default FilePreviewer;
