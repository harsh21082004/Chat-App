import React, { useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // 1. Added useNavigate
import { useSelector, useDispatch } from 'react-redux'; // 2. Added useDispatch
import { setChatPerson } from '../redux/slices/userSlice'; // 3. Added Action

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);

    const location = useLocation();
    const [open, setOpen] = useState(false);

    // --- 4. ULTRON DATA ---
    const ULTRON_DATA = {
        _id: "6943ac1635b940e679bd875a",
        name: "Ultron",
        email: "ultron@gmail.com",
        profilePhoto: "/api/auth/file/1766036013666-file-Orion Nebula.jpg"
    };

    // --- 5. HANDLER TO OPEN ULTRON CHAT ---
    const handleOpenUltron = () => {
        dispatch(setChatPerson(ULTRON_DATA));
        navigate('/');
    };

    const toggleOpenHam = () => {
        setOpen(!open);
    };

    // Calculate the position of the active bar based on the route
    // 🔽 UPDATED OFFSETS: Shifted down by 50px because we added Ultron
    const calculateActiveBarPosition = () => {
        switch (location.pathname) {
            case '/':
                return '0'; // Chat position
            case '/status':
                return '100px'; // Shifted from 50 -> 100
            case '/calls':
                return '150px'; // Shifted from 100 -> 150
            default:
                return '0';
        }
    };

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
                        {/* 1. Chats Link */}
                        <Link to={'/'}>
                            <img 
                                src="/chat.png" 
                                alt="" 
                                className={`${location.pathname === '/' && styles.activeLink}`} 
                            />
                            <p>Chats</p>
                        </Link>

                        {/* 2. NEW ULTRON BUTTON */}
                        {/* We use a div to mimic the Link structure but trigger the handler */}
                        <div onClick={handleOpenUltron} style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '3px', display: 'flex' }}>
                            {/* Using FontAwesome robot icon to match style */}
                            <img 
                                src='Ultron-AI.png'
                                className={styles.ultron} 
                                style={{ 
                                    margin: 'auto',
                                    borderRadius: '50%',
                                }} 
                                alt='Ultron'
                                />
                            <p>Ultron</p>
                        </div>

                        {/* 3. Status Link */}
                        <Link to={'/status'}>
                            <img 
                                src="/status.png" 
                                alt="" 
                                className={`${location.pathname === '/status' && styles.activeLink}`} 
                            />
                            <p>Status</p>
                        </Link>

                        {/* 4. Calls Link */}
                        <Link to={'/calls'}>
                            <img 
                                src="/telephone.png" 
                                alt="" 
                                className={`${location.pathname === '/calls' && styles.activeLink}`} 
                            />
                            <p>Calls</p>
                        </Link>

                        {/* Active Indicator Bar */}
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