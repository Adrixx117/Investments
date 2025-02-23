// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyaQk8z_p8EsymWVGV9KTTO2leKctT8vM",
  authDomain: "finanzas-38f9e.firebaseapp.com",
  projectId: "finanzas-38f9e",
  storageBucket: "finanzas-38f9e.firebasestorage.app",
  messagingSenderId: "35935558157",
  appId: "1:35935558157:web:679dfdc1b5a6763fcf9344",
  measurementId: "G-R6G0RDLF0Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);
export {db};