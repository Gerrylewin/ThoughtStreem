import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas",
  authDomain: "thoughtstream-demo.firebaseapp.com",
  projectId: "thoughtstream-demo",
  storageBucket: "thoughtstream-demo.appspot.com",
  messagingSenderId: "581326886241",
  appId: "1:581326886241:web:c0c9a5a551184eb4fd440d",
  databaseURL: "https://thoughtstream-demo-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);