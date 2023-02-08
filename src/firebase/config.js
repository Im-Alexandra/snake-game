import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKCARH4in9nuhPwaan4qcn4q6o3ZB3iqI",
  authDomain: "snake-game-alexandra.firebaseapp.com",
  projectId: "snake-game-alexandra",
  storageBucket: "snake-game-alexandra.appspot.com",
  messagingSenderId: "336764496391",
  appId: "1:336764496391:web:d3251efd49813c2a7b18a2",
};

//init firebase
initializeApp(firebaseConfig);

//init serveices
const db = getFirestore();

export { db };
