import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8xtiafhnA9LOLdk7zhEdRpwvFRc2_Skg",
  authDomain: "guardify-a5579.firebaseapp.com",
  projectId: "guardify-a5579",
  storageBucket: "guardify-a5579.firebasestorage.app",
  messagingSenderId: "44200406295",
  appId: "1:44200406295:web:e547102ac77620c9279b52",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
