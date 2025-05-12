import React from 'react'
import styles from '../../styles/Buttons/BlueButton.module.css'
import { ColorRing } from 'react-loader-spinner'
import { useSelector } from 'react-redux'

const BlueButton = ({ submit, text, type }) => {

    const userState = useSelector(state => state.user)
    return (
        <button type={type} className={`${styles.btn} my-2`}>
            {userState?.status === 'loading' ? (<span><ColorRing
                visible={true}
                height="37"
                width="37"
                ariaLabel="color-ring-loading"
                wrapperStyle={{}}
                wrapperClass="color-ring-wrapper"
                colors={['#ffffff','#ffffff','#ffffff','#ffffff','#ffffff']}
            /></span>) : (<span onClick={submit}>{text}</span>)}
        </button>
    )
}

export default BlueButton