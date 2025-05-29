import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';

const DisplayDay = ({ msg, i, messages }) => {
    const getDisplayDate = (dateString) => {
        const date = new Date(dateString);
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'EEEE, d MMM yyyy'); // e.g., "Sunday, 12 May 2025"
    };

    const currentDateLabel = getDisplayDate(msg.timestamp);
    const prevDateLabel =
        i > 0 ? getDisplayDate(messages[i - 1].timestamp) : null;

    const showDateLabel = currentDateLabel !== prevDateLabel;

    return (
        <React.Fragment key={msg._id}>
            {showDateLabel && (
                <div className="text-center text-gray-500 my-3 text-sm py-2 date-label">
                    {currentDateLabel}
                </div>
            )}
            {/* Your actual message rendering here, e.g. */}
            {/* <MessageBubble message={msg} /> */}

            <style jsx>{`
      .date-label {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2px 10px;
        border-radius: 5px;
        background-color: #23222A;
        max-width: max-content;
        font-size: 0.8rem;
        font-weight: 500;
        color: #ccc;
        margin: auto;
      }
    `}</style>
        </React.Fragment>
    );
};

export default DisplayDay;
