import React from 'react';

const PlayButton = ({ top = 50, playVideo }) => {
    return (
        <div
            onClick={playVideo}
            className="play-button"
            style={{
                top: `${top}%`,
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '50%',
                width: '20%',
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                cursor: 'pointer',
            }}
        >
            <i className="fa-solid fa-play" style={{ color: 'white' }}></i>
        </div>
    );
};

export default PlayButton;
