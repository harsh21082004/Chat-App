import React, { useContext, useEffect, useState } from 'react';
import styles from '../styles/NewChatModel.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { setChatPerson } from '../redux/slices/userSlice';
import { toggleActivePage } from '../redux/thunks/chatThunks';
// import { NewChatContext } from '../context/NewChatContext';
// import { AccountContext } from '../context/AccountContext';

const NewChatModel = () => {
    // const { isNewChatModalOpen, toggleNewChatModal, users } = useContext(NewChatContext);
    // const { user, setChatPerson } = useContext(AccountContext);
    const dispatch = useDispatch();
    const { user, users, chatPerson } = useSelector((state) => state.user);
    const { activePage } = useSelector((state) => state.chat)
    const [searchTerm, setSearchTerm] = useState('');

    const [userList, setUserList] = useState([]);

    useEffect(() => {
        if (users && Array.isArray(users)) {
            const updatedUserList = users.map((u) => ({
                ...u,
                name: u._id === user._id ? `${u.name} (You)` : u.name
            }));
            setUserList(updatedUserList);
        }
    }, [users, user]);

    console.log(chatPerson)

    const handleAddChat = (selectedUser) => async () => {
        dispatch(setChatPerson(selectedUser));
        toggleActivePage('conversations')(dispatch);
    };

    const filteredReceivers = userList.filter(receiver =>
        receiver.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className={`${styles.newChatModel} ${activePage === "newChatModel" ? styles.chatModalOpen : styles.chatModalClose}`}>
            <div className={`${styles.header}`}>
                <div className={`${styles.top}`}>
                    <div className={`${styles.left}`}>
                        <h2>Add New Chat</h2>
                    </div>
                    <div className={`${styles.right}`}>
                        <img src="/close.png" alt="close" onClick={
                            () => {
                                toggleActivePage('conversations')(dispatch);
                            }
                        } />
                    </div>
                </div>
                <form className={`${styles.bottom}`}>
                    <div className={`${styles.input}`}>
                        <input
                            type="text"
                            id='search'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} placeholder='Search' />
                        <span><label htmlFor="search"><img src="/search.png" alt="search" /></label></span>
                    </div>
                </form>
            </div>
            <div className={`${styles.body}`}>
                {filteredReceivers?.map((u) => (
                    <div className={`${styles.chats}`} key={u._id} onClick={handleAddChat(u)}>
                        <div className={`${styles.profile}`}>
                            <img src={u.profilePhoto || "/anonymous.png"} alt="profile" />
                            <div className={`${styles.details}`}>
                                <h3>{u.name}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewChatModel;
