import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2xTO-QS53VLP4g-rTI9tyTzhekh-dXEo",
  authDomain: "mythicbattles-2f50e.firebaseapp.com",
  projectId: "mythicbattles-2f50e",
  storageBucket: "mythicbattles-2f50e.firebasestorage.app",
  messagingSenderId: "520916571708",
  appId: "1:520916571708:web:3da9be6520d22b33fad539",
  measurementId: "G-0HLDYSSJM2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.auth = auth;
window.db = db;

const signupBtn = document.getElementById("signupBtn");
if (signupBtn) {
  signupBtn.onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        collection: []
      });
      alert("Sign up successful!");
      window.location.href = "login.html";
    } catch (error) {
      alert(error.message);
    }
  };
}

const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const docSnap = await getDoc(doc(db, "users", uid));
      if (docSnap.exists()) {
        const userData = docSnap.data();
        localStorage.setItem("cardCollection", JSON.stringify(userData.collection));
      } else {
        localStorage.setItem("cardCollection", "[]");
      }
      window.location.href = "index.html";
    } catch (error) {
      alert(error.message);
    }
  };
}

window.logoutUser = async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "login.html";
};
