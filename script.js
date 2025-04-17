import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase config
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

let userId = null;
let userCollection = [];

// Your existing card pool
const cardPool = [
  { id: 1, name: "Inferno Dragon", atk: 8, def: 6, sp: "Burn", rarity: "Rare", color: "#ff4500", img: "cards/Inferno Dragon.png", lore: "A legendary beast born from molten lava, said to melt mountains." },
  { id: 2, name: "Aqua Serpent", atk: 6, def: 8, sp: "Flood", rarity: "Uncommon", color: "#1e90ff", img: "cards/Aqua Serpent.png", lore: "Dweller of deep oceans, it commands the tides with a hiss." },
  { id: 3, name: "Terra Golem", atk: 7, def: 9, sp: "Shield", rarity: "Rare", color: "#8b4513", img: "cards/Terra Golem.png", lore: "A colossus forged from ancient stone and earth magic." },
  { id: 4, name: "Wind Falcon", atk: 9, def: 5, sp: "Gale", rarity: "Common", color: "#4682b4", img: "cards/Wind Falcon.png", lore: "Swift and silent, it commands the skies with a cry." },
  { id: 5, name: "Shadow Lynx", atk: 10, def: 4, sp: "Ambush", rarity: "Ultra Rare", color: "#2f4f4f", img: "cards/Shadow Lynx.png", lore: "Stalking the night, it strikes from darkness with precision." },
  { id: 6, name: "Solar Phoenix", atk: 12, def: 7, sp: "Rebirth", rarity: "Legendary", color: "#cc3300", img: "cards/Solar Phoenix.png", lore: "Reborn from ash, this celestial bird radiates eternal fire." },
  { id: 7, name: "Storm Elemental", atk: 11, def: 8, sp: "Discharge", rarity: "Ultra Rare", color: "#008080", img: "cards/Storm Elemental.png", lore: "Electric rage given form." },
  { id: 8, name: "Wispling", atk: 4, def: 3, sp: "Illuminate", rarity: "Common", color: "#555555", img: "cards/Wispling.png", lore: "Glows bright enough to blind its foes." }
];

// Pull rate configuration
const pullRates = {
  "Starter Pack": { Common: 0.5, Uncommon: 0.3, Rare: 0.15, "Ultra Rare": 0.04, Legendary: 0.01 },
  "Legendary Pack": { Common: 0.3, Uncommon: 0.3, Rare: 0.2, "Ultra Rare": 0.15, Legendary: 0.05 }
};

// Load user and initialize
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userId = user.uid;
    const snap = await getDoc(doc(db, "users", userId));
    userCollection = snap.exists() ? snap.data().collection : [];
    renderCollection();
  } else {
    window.location.href = "login.html";
  }
});

// UI render
function renderCollection() {
  const container = document.getElementById("cardContainer");
  if (!container) return;
  container.innerHTML = "";
  for (const card of cardPool) {
    const owned = userCollection.includes(card.id);
    const div = document.createElement("div");
    div.style.border = "1px solid black";
    div.style.padding = "10px";
    div.style.margin = "10px";
    div.style.background = owned ? card.color : "#ccc";
    div.innerHTML = `
      <h3>${card.name}</h3>
      <img src="${card.img}" style="width:100px"><br>
      <strong>ATK:</strong> ${card.atk} | <strong>DEF:</strong> ${card.def}<br>
      <strong>Special:</strong> ${card.sp}<br>
      <em>${card.lore}</em><br>
      ${owned ? '<em>Owned</em>' : `<button onclick="unlockCard(${card.id})">Unlock</button>`}
    `;
    container.appendChild(div);
  }
}

// Save to Firestore + local
async function saveCollection() {
  if (userId) {
    await setDoc(doc(db, "users", userId), { collection: userCollection });
    localStorage.setItem("cardCollection", JSON.stringify(userCollection));
  }
}

// Unlock card
window.unlockCard = async function(cardId) {
  if (!userCollection.includes(cardId)) {
    userCollection.push(cardId);
    await saveCollection();
    renderCollection();
  }
};
