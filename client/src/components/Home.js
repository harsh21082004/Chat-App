import React from 'react'
import styles from '../styles/Home.module.css'
import Sidebar from './Sidebar';
import Conversations from './Conversations';
import Chat from './Chat';
import NewChatModel from './NewChatModel';

const Home = () => {

  // ${isConversationOpen ? styles.conversationsOpen : styles.conversationsClose}
  
  return (
    <div className={`${styles.home}`}>
      <Sidebar />
      <div className={`${styles.right}`}>
        <div className={`${styles.main} `}>
          <Conversations />
          <NewChatModel />
        </div>
        <Chat />
      </div>
    </div>
  )
}

export default Home