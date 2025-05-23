import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyAiUX2EOaiEglKOHt0xNeorcpYlpHgtDFU",
    authDomain: "freelanceroo.firebaseapp.com",
    projectId: "freelanceroo",
    storageBucket: "freelanceroo.firebasestorage.app",
    messagingSenderId: "115916574520",
    appId: "1:115916574520:web:457defca757c1678adfbcd",
    measurementId: "G-8XKMHH97J3"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

export { app, auth, storage, db }