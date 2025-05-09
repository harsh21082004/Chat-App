import React, { useContext, useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {

    const { user } = useSelector((state) => state.user);

    const location = useLocation();
    const [open, setOpen] = useState(false);

    const toggleOpenHam = () => {
        setOpen(!open);
    };

    // Calculate the position of the active bar based on the route
    const calculateActiveBarPosition = () => {
        switch (location.pathname) {
            case '/':
                return '0'; // Default position
            case '/status':
                return '50px'; // Example: shift by 50px for 'status' page
            case '/calls':
                return '100px'; // Example: shift by 100px for 'calls' page
            default:
                return '0'; // Default case, fallback
        }
    };
    // className={`${theme === 'light' ? styles.activeTheme : ''}`} onClick={toggleTheme}

    return (
        <div className={`${styles.sidebar} ${open ? styles.sidebarOpen : styles.sidebarClose} `}>
            <div className={styles.top}>
                <div className={`${styles.hamburger} ${open ? styles.hamOpen : styles.hamClose}`} onClick={toggleOpenHam}>
                    <div>
                        <div className={styles.line}></div>
                        <div className={styles.line}></div>
                        <div className={styles.line}></div>
                    </div>
                    <p>Menu</p>
                </div>
                <div className={styles.profile}>
                    <img src={`${process.env.REACT_APP_BACKEND_BASE_URL + user?.profilePhoto}`} alt="profile" />
                    <i className="fa-solid fa-plus"></i>
                    <p>Profile</p>
                </div>
                <div className={styles.menu}>
                    <ul>
                        <Link to={'/'}><img src="/chat.png" alt="" className={`${location.pathname === '/' && styles.activeLink}`} onClick={(e) => {
                            // handleOpenConversation();
                            // setChatPerson('')
                        }} /><p>Chats</p></Link>
                        <Link to={'/status'}><img src="/status.png" alt="" className={`${location.pathname === '/status' && styles.activeLink}`} /><p>Status</p></Link>
                        <Link to={'/calls'}><img src="/telephone.png" alt="" className={`${location.pathname === '/calls' && styles.activeLink}`} /><p>Calls</p></Link>
                        <div className={styles.activeBar} style={{ transform: `translateY(${calculateActiveBarPosition()})` }}></div>
                    </ul>
                </div>
            </div>
            <div className={`${styles.bottom}`}>
                <div className={styles.themeButton}>
                    {/* Button for light theme */}
                    <div>
                        <img src="/sun.png" alt="Light Mode" />
                        <p>Light</p>
                    </div>
                    {/* Button for dark theme */}
                    <div>
                        <img src="/moon.png" alt="Dark Mode" />
                        <p>Dark</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
