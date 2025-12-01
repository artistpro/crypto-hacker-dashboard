import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBndIKt7SPNUl4mG7IRVd6EGUGkZLpLD0A",
    authDomain: "dashboard-bch.firebaseapp.com",
    databaseURL: "https://dashboard-bch-default-rtdb.firebaseio.com",
    projectId: "dashboard-bch",
    storageBucket: "dashboard-bch.firebasestorage.app",
    messagingSenderId: "1082690329234",
    appId: "1:1082690329234:web:8129fa99bdded9aa3f244b",
    measurementId: "G-D66Z66FM1X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
