import React from 'react'
import { ColorRing } from 'react-loader-spinner'

const ChatLoading = () => {
    return (
        <div className='d-flex justify-content-center m-2'><ColorRing
            visible={true}
            height="37"
            width="37"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']}
        /></div>
    )
}

export default ChatLoading