import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6sfVY_yD116kW1eP3_JZc-InlQBRhJBM",
    authDomain: "wedsindia-booking.firebaseapp.com",
    projectId: "wedsindia-booking",
    storageBucket: "wedsindia-booking.firebasestorage.app",
    messagingSenderId: "458982967426",
    appId: "1:458982967426:web:c34a6987bb4cd2111bcc9b",
    measurementId: "G-D0YK0JX8M6"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
