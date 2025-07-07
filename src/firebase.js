import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';


import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyA_9DCyI_EDnK1l4BKq-LZrE68wqOL_OWU",
  authDomain: "quanrum-f16a6.firebaseapp.com",
  databaseURL: "https://quanrum-f16a6-default-rtdb.firebaseio.com",
  projectId: "quanrum-f16a6",
  storageBucket: "quanrum-f16a6.firebasestorage.app",
  messagingSenderId: "215452353962",
  appId: "1:215452353962:web:90eb72462a660aa1dfd7d3",
  measurementId: "G-J4LXS69BRY"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const DATABASE_URL = firebaseConfig.databaseURL;