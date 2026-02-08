// @ts-ignore
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDaVfRWa0W0RL_SBIzktycBv0oMNGlOTKA",
  authDomain: "fender-f52d4.firebaseapp.com",
  projectId: "fender-f52d4",
  storageBucket: "fender-f52d4.firebasestorage.app",
  messagingSenderId: "329204918089",
  appId: "1:329204918089:web:c1b3e75e6520729716dc98",
  measurementId: "G-PG9DZ90VT3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);