import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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

// Card pool
const cardPool = [/* ... your full card list ... */];

// Pull rate config
const pullRates = {
  "Starter Pack": { Common: 0.5, Uncommon: 0.3, Rare: 0.15, "Ultra Rare": 0.04, Legendary: 0.01 },
  "Legendary Pack": { Common: 0.3, Uncommon: 0.3, Rare: 0.2, "Ultra Rare": 0.15, Legendary: 0.05 }
};

// Auth check and load
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

// Render collection
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

// Save collection
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

// Logout
window.logoutUser = async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "login.html";
};

// Open pack
window.openPack = function () {
  const selectedPack = "Starter Pack"; // or use selected value if you want dynamic selection
  const pack = generatePack(selectedPack);
  const names = pack.map(c => c.name).join(", ");
  alert(`You opened: ${names}`);
  pack.forEach(card => {
    if (!userCollection.includes(card.id)) {
      userCollection.push(card.id);
    }
  });
  saveCollection();
  renderCollection();
};

function generatePack(type) {
  const rates = pullRates[type];
  const pack = [];
  for (let i = 0; i < 3; i++) {
    const rarity = getRandomRarity(rates);
    const choices = cardPool.filter(c => c.rarity === rarity);
    const selected = choices[Math.floor(Math.random() * choices.length)];
    pack.push(selected);
  }
  return pack;
}

function getRandomRarity(rates) {
  const rand = Math.random();
  let sum = 0;
  for (const [rarity, prob] of Object.entries(rates)) {
    sum += prob;
    if (rand <= sum) return rarity;
  }
  return "Common";
}

// Battle
window.startBattle = function () {
  const ownedCards = cardPool.filter(c => userCollection.includes(c.id));
  if (ownedCards.length === 0) {
    alert("You have no cards! Open a pack first.");
    return;
  }

  const player = ownedCards[Math.floor(Math.random() * ownedCards.length)];
  const enemy = cardPool[Math.floor(Math.random() * cardPool.length)];

  const playerEl = document.getElementById("player-card");
  const enemyEl = document.getElementById("enemy-card");
  const resultEl = document.getElementById("battle-result");

  playerEl.innerHTML = `<strong>${player.name}</strong><br><img src="${player.img}" width="100"><br>ATK: ${player.atk} | DEF: ${player.def}`;
  enemyEl.innerHTML = `<strong>${enemy.name}</strong><br><img src="${enemy.img}" width="100"><br>ATK: ${enemy.atk} | DEF: ${enemy.def}`;

  let result = "";
  if (player.atk > enemy.def) {
    result = "You Win!";
  } else if (player.atk < enemy.def) {
    result = "You Lose!";
  } else {
    result = "It's a draw.";
  }

  resultEl.textContent = result;
};
