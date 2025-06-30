import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA_9DCyI_EDnK1l4BKq-LZrE68wqOL_OWU',
  authDomain: 'quanrum-f16a6.firebaseapp.com',
  projectId: 'quanrum-f16a6',
  storageBucket: 'quanrum-f16a6.firebasestorage.app',
  messagingSenderId: '215452353962',
  appId: '1:215452353962:web:90eb72462a660aa1dfd7d3',
  measurementId: 'G-J4LXS69BRY',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const DATABASE_URL = 'https://quanrum-f16a6-default-rtdb.firebaseio.com';
export const API_SECRET = '4mdYFD1CEWUKEXjuSoIYgeSbQ7K9WFanIaBkPZrI';