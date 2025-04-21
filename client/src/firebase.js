// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB-Lvn0yKwwRmqpTL5-_6zhruaM0xr6qPs",
    authDomain: "bizconvo-b94c7.firebaseapp.com",
    projectId: "bizconvo-b94c7",
    storageBucket: "bizconvo-b94c7.firebasestorage.app",
    messagingSenderId: "1099139168075",
    appId: "1:1099139168075:web:14d59d7049b94a32409ace",
    measurementId: "G-79X7CY3LSZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };