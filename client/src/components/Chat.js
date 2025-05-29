import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../styles/Chat.module.css';
import { Link } from 'react-router-dom';
import { setNewMessage, setMessages, setHasMoreMessages, setMessagePage } from '../redux/slices/chatSlice';
import { addConversation, getConversations } from '../redux/thunks/conversationThunk';
import { sendMessage, getMessages } from '../redux/thunks/chatThunks';
import ImageViewer from './ImageViewer';
import FilePreviewer from './FilePreviewer';
import TextOrImageMessage from './Chat/TextOrImageMessage';
import ImageWithFileCaption from './Chat/ImageWithFileCaption';
import OtherFiles from './Chat/OtherFiles';
import AudioPlayer from './Chat/AudioPlayer';
import VideoMessage from './Chat/VideoMessage';
import AudioRecorder from './Chat/AudioRecorder';
import VideoViewer from './VideoViewer';
import ChatSkeleton from './Chat/ChatSkeleton';
import ChatLoading from './Chat/ChatLoading';
import DisplayDay from './Chat/DisplayDay';
import VideoWithFileCaption from './Chat/VideoWithFileCaption';

const Chat = () => {
  const dispatch = useDispatch();
  const { chatPerson, user } = useSelector((state) => state.user);
  const chatState = useSelector((state) => state.chat);
  const conversationState = useSelector((state) => state.conversation);

  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // ✅ Defined
  const [isImageOpened, setIsImageOpened] = useState(false);
  const [isVideoOpened, setIsVideoOpened] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [imageIndex, setImageIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recorder, setRecorder] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(new Array(60).fill(0));
  const [mediaStream, setMediaStream] = useState(null); // add this to your state
  const [isFetchingMore, setIsFetchingMore] = useState(false);





  const recordedChunks = useRef([]);
  const animationRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);


  const scrollRef = useRef(null);
  const newMessageLabelRef = useRef(null);
  const chatContainerRef = useRef(null);

  const textRef = useRef(null);



  useEffect(() => {
    const el = textRef.current;
    if (el) {
      el.style.height = "50px"; // Reset to 1 line
      const scrollHeight = el.scrollHeight;
      el.style.height = `${Math.min(scrollHeight, 120)}px`; // Cap at ~5 lines
    }
  }, [message]);

  const toggleImageView = (imageIndex, file) => {
    setImageUrl(file?.url);
    setImageIndex(imageIndex);
    setIsImageOpened(!isImageOpened);
  };

  const toggleVideoView = (videoIndex, file) => {
    setVideoUrl(file?.url);
    setVideoIndex(videoIndex);
    setIsVideoOpened(!isVideoOpened);
  };



  let frameCount = 0;

  const updateWaveform = (analyserNode, timeData) => {
    if (!analyserNode || !isRecordingRef.current || isPausedRef.current) return;

    analyserNode.getByteTimeDomainData(timeData);


    // Convert to -1 to 1 and take absolute value
    const normalizedData = [...timeData].map(v => Math.abs((v - 128) / 64));

    // Use a single sample or average to plot one bar
    const avgAmplitude = normalizedData.reduce((a, b) => a + b, 0) / normalizedData.length;

    const maxBarHeight = 50;
    const scaledHeight = avgAmplitude * maxBarHeight * 2;

    frameCount++;
    if (frameCount % 6 === 0) {
      setDataArray((prev) => [...prev.slice(1), scaledHeight]);
    }

    animationRef.current = requestAnimationFrame(() =>
      updateWaveform(analyserNode, timeData)
    );
  };


  //set audio Url and audioBlob
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setMediaStream(stream);

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const newRecorder = new MediaRecorder(stream);
    recordedChunks.current = []; // ✅ Reset before starting
    newRecorder.start();

    newRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.current.push(e.data); // ✅ Save each chunk
      }
    };

    const source = audioCtx.createMediaStreamSource(stream);

    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    compressor.knee.setValueAtTime(40, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

    const analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.8;

    source.connect(compressor);
    compressor.connect(analyserNode);

    const bufferLength = analyserNode.fftSize;
    const timeData = new Uint8Array(bufferLength);

    setAudioContext(audioCtx);
    setAnalyser(analyserNode);
    setRecorder(newRecorder);
    setIsRecording(true);

    isRecordingRef.current = true;
    isPausedRef.current = false;

    animationRef.current = requestAnimationFrame(() =>
      updateWaveform(analyserNode, timeData)
    );

    const id = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
  };






  const pauseRecording = () => {
    if (recorder && recorder.state === 'recording') {
      recorder.pause();
      isPausedRef.current = true;
      setIsPaused(true);
      clearInterval(intervalId);
    }
  };

  const togglePauseRecording = () => {
    if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  }


  const resumeRecording = () => {
    if (recorder && recorder.state === 'paused') {
      recorder.resume();
      isPausedRef.current = false;
      setIsPaused(false);

      const id = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);

      if (analyser) {
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        animationRef.current = requestAnimationFrame(() =>
          updateWaveform(analyser, freqData)
        );
      }
    }
  };


  const stopMediaStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop()); // ⛔️ this stops the mic
      setMediaStream(null);
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = () => {
          const blob = new Blob(recordedChunks.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);
          resolve(blob);
        };
        recorder.stop();
      } else {
        resolve(null);
      }

      clearInterval(intervalId);
      setIsRecording(false);
      setRecordingTime(0);
      isRecordingRef.current = false;
      isPausedRef.current = false;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      stopMediaStream();
    });
  };



  const cancelRecording = () => {
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    clearInterval(intervalId);
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl('');

    isRecordingRef.current = false;
    isPausedRef.current = false;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    stopMediaStream(); // ⛔️ stop mic
  };


  const handleScroll = (e) => {
    const top = e.target.scrollTop;

    if (top === 0 && chatState.hasMoreMessages && !isFetchingMore) {
      setIsFetchingMore(true);
      dispatch(setMessagePage(chatState.messagePage + 1));
    }
  };



  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatPerson?._id || !user?._id) return;

      let conversation = conversationState.conversations.find(convo => (
        (convo.senderId._id === user._id && convo.receiverId._id === chatPerson._id) ||
        (convo.receiverId._id === user._id && convo.senderId._id === chatPerson._id)
      ));

      if (!conversation) return;

      const result = await dispatch(getMessages({
        conversationId: conversation._id,
        page: chatState.messagePage,
        limit: chatState.limit,
      }));

      if (getMessages.fulfilled.match(result)) {
        const { messages, hasMore } = result.payload;

        dispatch(setMessages({
          messages,
          conversationId: conversation._id,
          append: chatState.messagePage > 0,
        }));

        if (hasMore > 0) {
          dispatch(setHasMoreMessages(hasMore));
        }

        // Wait for DOM to update
        setTimeout(() => {
          if (chatContainerRef.current) {
            // Scroll down just slightly to allow next scrollTop === 0 trigger
            chatContainerRef.current.scrollTop = 1;
          }
        }, 0);

      } else {
        console.error('Failed to load messages:', result.error.message);
      }

      setIsFetchingMore(false);
    };

    fetchMessages();
  }, [chatPerson, user, chatState.messagePage]);





  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const newLabel = newMessageLabelRef.current;

      if (unreadCount > 0 && newLabel) {
        const labelOffsetTop = newLabel.offsetTop;
        const containerHeight = container.clientHeight;

        // Scroll so that the "New Messages" label appears at the bottom
        container.scrollTop = labelOffsetTop - containerHeight + newLabel.clientHeight;
      } else {
        // No unread messages, scroll to bottom
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [chatState.newMessage]);



  const handleSendMessage = async (e) => {
    e.preventDefault();
    const blob = await stopRecording();

    if (!blob && !message && !file) {
      console.error("Audio blob is null");
      return;
    }
    if (!message && !file && !blob) return;


    try {
      dispatch(setNewMessage(message));

      const conversationData = {
        senderId: user._id,
        receiverId: chatPerson._id,
        lastMessage: file || audioBlob ? 'Sent a file' : message,
        lastMessageTimestamp: Date.now(),
      };

      const convoResult = await dispatch(addConversation(conversationData));
      if (addConversation.fulfilled.match(convoResult)) {
        const conversationId = convoResult.payload.conversation._id;
        await dispatch(getConversations(user._id));

        let msgPayload = new FormData();

        if (file) {
          for (let i = 0; i < file.length; i++) {
            msgPayload.append('files', file[i]);
          }
          msgPayload.append('conversationId', conversationId);
          msgPayload.append('senderId', user._id);
          msgPayload.append('receiverId', chatPerson._id);
          msgPayload.append('messageType', 'file');
        } else if (blob) {
          msgPayload.append('files', blob);
          msgPayload.append('conversationId', conversationId)
          msgPayload.append('messageType', 'audio');
          msgPayload.append('senderId', user._id)
          msgPayload.append('receiverId', chatPerson._id);
          msgPayload.append('filecaption', '',)
        } else {
          msgPayload.append('content', message);
          msgPayload.append('conversationId', conversationId);
          msgPayload.append('senderId', user._id);
          msgPayload.append('receiverId', chatPerson._id);
          msgPayload.append('messageType', 'text');
        }

        const msgResult = await dispatch(sendMessage(msgPayload));

        if (sendMessage.fulfilled.match(msgResult)) {
          // console.log('Message sent:', msgResult.payload);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setMessage('');
      setFile(null);
    }
  };

  const isFirstInGroup = (messages, index) => {
    if (index === 0) return true;
    return messages[index].senderId !== messages[index - 1].senderId;
  };


  const messages = chatState.messages || [];
  const readMessages = messages.slice(0, messages.length - unreadCount);
  const unreadMessages = messages.slice(messages.length - unreadCount);




  const allImageFiles = messages.flatMap(msg =>
    msg.files.map(file => ({
      ...file,
      timestamp: msg.timestamp,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
    }))
  );

  const allVideoFiles = messages.flatMap(msg =>
    msg.files.map(file => ({
      ...file,
      timestamp: msg.timestamp,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
    }))
  );

  const imageMessages = allImageFiles.filter(
    (msg) =>
      msg.fileType.startsWith('image/')
  );

  const videoMessages = allVideoFiles.filter(
    (msg) =>
      msg.fileType.startsWith('video/')
  );

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(1, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const iconRef = useRef(null);

  useEffect(() => {
    const el = iconRef.current;
    if (el) {
      // Remove and re-add the class to re-trigger animation
      el.classList.remove('bubble-animation');
      // Trigger reflow
      void el.offsetWidth;
      el.classList.add('bubble-animation');
    }
  }, [isPaused]);

  const iconClass = isPaused ? 'fa-solid fa-microphone' : 'fa-regular fa-circle-pause';



  return (
    <>
      {chatPerson?._id ? (
        <div className={styles.chat}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.profileImg}>
                <img src={`${process.env.REACT_APP_BACKEND_BASE_URL + chatPerson?.profilePhoto}`} alt="profile" />
              </div>
              <div className={styles.details}>
                <h3>{chatPerson?.name}</h3>
              </div>
            </div>
            <div className={styles.headerRight}>
              <Link><i className="fa-solid fa-phone"></i></Link>
              <Link><i className="fa-solid fa-video"></i></Link>
              <Link><i className="fa-solid fa-ellipsis-vertical"></i></Link>
            </div>
          </div>

          {chatState.messageFetchedStatus !== 'succeeded' ? (<ChatSkeleton />) : (<div className={styles.chatBody} ref={chatContainerRef} onScroll={handleScroll}>
            {chatState.fetchingMoreStatus === 'loading' && (<ChatLoading />)}
            {readMessages.map((msg, index) => {
              const firstInGroup = isFirstInGroup(readMessages, index);
              const isText = msg.messageType === 'text';
              const hasFiles = msg.files?.length > 0;

              const imageFiles = msg.files?.filter(file => file.fileType.startsWith('image/')) || [];
              const otherFiles = msg.files?.filter(file => !file.fileType.startsWith('image/') && !file.fileType.startsWith('video/') && !file.fileType.startsWith('audio/')) || [];
              const audioFiles = msg.files?.filter(file => file.fileType.startsWith('audio/')) || [];
              const videoFiles = msg.files?.filter(file => file.fileType.startsWith('video/')) || [];

              const imageFilesWithCaption = imageFiles.filter(file => file.filecaption?.trim() !== '');
              const videoFilesWithcaption = videoFiles.filter(file => file.filecaption?.trim() !== '');
              const imageFilesWithoutCaption = imageFiles.filter(file => !file.filecaption?.trim());
              const videoFilesWithoutCaption = videoFiles.filter(file => !file.filecaption?.trim());

              const moreImages = imageFilesWithoutCaption.length - 4;
              const moreVideos = videoFiles.length - 4;


              return (
                <>

                  <DisplayDay messages={readMessages} msg={msg} i={index} />
                  {/* Text or Image Grid (if no captions) */}
                  {(isText || imageFiles.filter(file => file.filecaption === '').length > 0) && (
                    <TextOrImageMessage index={index} msg={msg} imageFilesWithoutCaption={imageFilesWithoutCaption} moreImages={moreImages} firstInGroup={firstInGroup} isText={isText} readMessages={readMessages} scrollRef={scrollRef} toggleImageView={toggleImageView} />
                  )}

                  {(videoFiles.filter(file => file.filecaption === '').length > 0) && (
                    <VideoMessage index={index} msg={msg} videoFilesWithoutCaption={videoFilesWithoutCaption} firstInGroup={firstInGroup} moreVideos={moreVideos} isText={isText} readMessages={readMessages} scrollRef={scrollRef} toggleVideoView={toggleVideoView} />
                  )}

                  {/* Images with Captions (rendered separately) */}
                  {imageFilesWithCaption.length > 0 && imageFilesWithCaption.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    return (
                      <ImageWithFileCaption index={index} fileIndex={fileIndex} file={file} fileUrl={fileUrl} firstInGroup={firstInGroup} toggleImageView={toggleImageView} msg={msg} />
                    )
                  })}

                  {videoFilesWithcaption.length > 0 && videoFilesWithcaption.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    return (
                      <VideoWithFileCaption index={index} fileIndex={fileIndex} file={file} fileUrl={fileUrl} firstInGroup={firstInGroup} toggleVideoView={toggleVideoView} msg={msg} />
                    )
                  })}

                  {/* Other file types */}
                  {otherFiles.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    const containsCaption = file.filecaption?.trim() !== '';
                    return (
                      <OtherFiles index={index} fileIndex={fileIndex} file={file} fileUrl={fileUrl} containsCaption={containsCaption} firstInGroup={firstInGroup} msg={msg} />
                    );
                  })}

                  {audioFiles.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    const containsCaption = file.filecaption?.trim() !== '';
                    return (
                      <AudioPlayer file={file} audioUrl={fileUrl} firstInGroup={firstInGroup} msg={msg} index={index} fileIndex={fileIndex} containsCaption={containsCaption} />
                    );
                  })}

                </>
              );
            })}

            {unreadCount > 0 && (
              <div className={styles.newMessageLabel} ref={newMessageLabelRef}>
                <hr />
                <span style={{ color: 'gray', fontSize: '14px' }}>{unreadCount} Unread Messages</span>
                <hr />
              </div>
            )}


            {chatState.fetchingMoreStatus === 'loading' && (<ChatLoading />)}
            {unreadMessages.map((msg, index) => {
              const firstInGroup = isFirstInGroup(readMessages, index);
              const isText = msg.messageType === 'text';
              const hasFiles = msg.files?.length > 0;

              const imageFiles = msg.files?.filter(file => file.fileType.startsWith('image/')) || [];
              const otherFiles = msg.files?.filter(file => !file.fileType.startsWith('image/') && !file.fileType.startsWith('video/') && !file.fileType.startsWith('audio/')) || [];
              const audioFiles = msg.files?.filter(file => file.fileType.startsWith('audio/')) || [];
              const videoFiles = msg.files?.filter(file => file.fileType.startsWith('video/')) || [];

              const imageFilesWithCaption = imageFiles.filter(file => file.filecaption?.trim() !== '');
              const videoFilesWithcaption = videoFiles.filter(file => file.filecaption?.trim() !== '');
              const imageFilesWithoutCaption = imageFiles.filter(file => !file.filecaption?.trim());
              const videoFilesWithoutCaption = videoFiles.filter(file => !file.filecaption?.trim());

              const moreImages = imageFilesWithoutCaption.length - 4;
              const moreVideos = videoFiles.length - 4;


              return (
                <>

                  <DisplayDay messages={readMessages} msg={msg} i={index} />
                  {/* Text or Image Grid (if no captions) */}
                  {(isText || imageFiles.filter(file => file.filecaption === '').length > 0) && (
                    <TextOrImageMessage index={index} msg={msg} imageFilesWithoutCaption={imageFilesWithoutCaption} moreImages={moreImages} firstInGroup={firstInGroup} isText={isText} readMessages={readMessages} scrollRef={scrollRef} toggleImageView={toggleImageView} />
                  )}

                  {(videoFiles.filter(file => file.filecaption === '').length > 0) && (
                    <VideoMessage index={index} msg={msg} videoFilesWithoutCaption={videoFilesWithoutCaption} firstInGroup={firstInGroup} moreVideos={moreVideos} isText={isText} readMessages={readMessages} scrollRef={scrollRef} toggleVideoView={toggleVideoView} />
                  )}

                  {/* Images with Captions (rendered separately) */}
                  {imageFilesWithCaption.length > 0 && imageFilesWithCaption.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    return (
                      <ImageWithFileCaption index={index} fileIndex={fileIndex} file={file} fileUrl={fileUrl} firstInGroup={firstInGroup} toggleImageView={toggleImageView} msg={msg} />
                    )
                  })}

                  {videoFilesWithcaption.length > 0 && videoFilesWithcaption.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    return (
                      <VideoWithFileCaption index={index} fileIndex={fileIndex} file={file} fileUrl={fileUrl} firstInGroup={firstInGroup} toggleVideoView={toggleVideoView} msg={msg} />
                    )
                  })}

                  {/* Other file types */}
                  {otherFiles.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    const containsCaption = file.filecaption?.trim() !== '';
                    return (
                      <OtherFiles index={index} fileIndex={fileIndex} file={file} fileUrl={fileUrl} containsCaption={containsCaption} firstInGroup={firstInGroup} msg={msg} />
                    );
                  })}

                  {audioFiles.map((file, fileIndex) => {
                    const fileUrl = `${process.env.REACT_APP_BACKEND_BASE_URL + file.url}`;
                    const containsCaption = file.filecaption?.trim() !== '';
                    return (
                      <AudioPlayer file={file} audioUrl={fileUrl} firstInGroup={firstInGroup} msg={msg} index={index} fileIndex={fileIndex} containsCaption={containsCaption} />
                    );
                  })}

                </>
              );
            })}

          </div>)}

          <div className={styles.footer}>
            <form onSubmit={handleSendMessage}>
              <div className={styles.input}>
                {isRecording ? (
                  // ✅ Show only voice recorder UI
                  <AudioRecorder dataArray={dataArray} iconRef={iconRef} iconClass={iconClass} isPaused={isPaused} togglePauseRecording={togglePauseRecording} handleSendMessage={handleSendMessage} formatTime={formatTime} recordingTime={recordingTime} cancelRecording={cancelRecording} />
                ) : (
                  // ✅ Default message input UI
                  <>
                    <label className={styles.attachFile} htmlFor="file">
                      <img src="/attach-file.png" alt="attach" />
                    </label>
                    <textarea
                      ref={textRef}
                      placeholder="Type a message"
                      className={styles.text}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <input
                      type="file"
                      id="file"
                      className={styles.file}
                      onChange={(e) => {
                        setFile(e.target.files);
                        setShowPreview(true);
                      }}
                      multiple
                    />

                    <div className={styles.footerIcons}>
                      <img src="/mic.png" alt="mic" onClick={startRecording} style={{ cursor: 'pointer' }} />
                      <div className={styles.sep}></div>
                      <button type="submit" className={styles.sendButton}>
                        <img src="/send.png" alt="send" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>

          {showPreview && <FilePreviewer files={file} onClose={() => {
            setFile(null);
            setShowPreview(false)
          }} />}
        </div>
      ) : (
        <div className={styles.emptyChat}>
          <img src="/emptyChat.png" alt="cloud" style={{ width: '500px', height: '500px' }} />
          <h2 style={{ color: 'gray' }}>Open a chat to start messaging</h2>
        </div>
      )}
      {isImageOpened && (
        <ImageViewer images={imageMessages} imageUrl={imageUrl} onClose={toggleImageView} chatPerson={chatPerson} />
      )}

      {isVideoOpened && (
        <VideoViewer videos={videoMessages} videoUrl={videoUrl} onClose={toggleVideoView} chatPerson={chatPerson} />
      )}

    </>
  );
};

export default Chat;
