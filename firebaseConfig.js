// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsxZKuADEDV7LNRteNaZwm2Sd3Vsk_pp0",
  authDomain: "taximapma.firebaseapp.com",
  projectId: "taximapma",
  storageBucket: "taximapma.firebasestorage.app",
  messagingSenderId: "882433594058",
  appId: "1:882433594058:web:de2529f210b88db74b1a33"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);