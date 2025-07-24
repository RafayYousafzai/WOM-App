import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB7hZG_SmrktcE-bw_5qcqjveywgrpjWjM",
  authDomain: "word-of-mouth-522ae.firebaseapp.com",
  projectId: "word-of-mouth-522ae",
  storageBucket: "word-of-mouth-522ae.firebasestorage.app",
  messagingSenderId: "1044792050622",
  appId: "1:1044792050622:web:cb1d8c7d08d1916d412fef",
  measurementId: "G-7NPERVR1QD",
};

const app = initializeApp(firebaseConfig);

const database = getFirestore(app);
const storage = getStorage(app);

export { database, storage };
export default app;
