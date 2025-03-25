import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_Kr-kcfMzLQiXYCvAOABvr9YZlM9lfRo",
  authDomain: "conlangists.firebaseapp.com",
  projectId: "conlangists",
  storageBucket: "conlangists.firebasestorage.app",
  messagingSenderId: "765986310859",
  appId: "1:765986310859:web:672fbe20e65e40325d694e",
  measurementId: "G-C8DFENJYFV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
