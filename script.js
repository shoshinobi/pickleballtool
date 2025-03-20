// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// 🔹 REPLACE WITH YOUR FIREBASE CONFIG 🔹
const firebaseConfig = {
    apiKey: "AIzaSyBUcvmCoJSukaQ5o_btp0bMSksLw2zCIoI",
    authDomain: "pickleballplayerlist-54733.firebaseapp.com",
    projectId: "pickleballplayerlist-54733",
    storageBucket: "pickleballplayerlist-54733.firebasestorage.app",
    messagingSenderId: "613225623433",
    appId: "1:613225623433:web:20af3581090694a6357b58"
  };

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const playersDoc = doc(db, "pickleball", "playersList");

let players = [];
let numRounds = 8;
let numCourts = 5;
let schedule = [];

// 🔹 Load Players from Firestore 🔹
async function loadPlayers() {
    onSnapshot(playersDoc, (docSnapshot) => {
        if (docSnapshot.exists()) {
            players = docSnapshot.data().list || [];
            displayPlayers();
            generateSchedule();
        }
    });
}

// 🔹 Save Players to Firestore 🔹
async function savePlayers() {
    await setDoc(playersDoc, { list: players });
}

// 🔹 Add New Player 🔹
function addPlayer() {
    let inputText = document.getElementById("playerName").value.trim().toUpperCase();
    if (inputText) {
        let newNames = inputText.split(",").map(name => name.trim()).filter(name => name !== "");
        newNames.forEach(name => {
            if (!players.includes(name)) {
                players.push(name);
            }
        });
        savePlayers();
    }
    document.getElementById("playerName").value = "";
}

// 🔹 Remove Player 🔹
function removePlayer(index) {
    players.splice(index, 1);
    savePlayers();
}

// 🔹 Clear Players 🔹
function clearPlayers() {
    players = [];
    savePlayers();
}

// 🔹 Update Settings 🔹
function updateSettings() {
    numCourts = parseInt(document.getElementById("numCourts").value) || numCourts;
    numRounds = parseInt(document.getElementById("numRounds").value) || numRounds;

    if (numCourts < 1) numCourts = 1;
    if (numCourts > 10) numCourts = 10;
    if (numRounds < 1) numRounds = 1;
    if (numRounds > 20) numRounds = 20;

    generateSchedule();
}

// 🔹 Generate Schedule 🔹
function generateSchedule() {
    const scheduleBody = document.getElementById("scheduleBody");
    if (players.length < 4) {
        scheduleBody.innerHTML = "<tr><td colspan='" + (numCourts + 1) + "'>Not enough players to create matches.</td></tr>";
        return;
    }

    let shuffledPlayers = [...players];
    schedule = [];

    for (let i = 0; i < numRounds; i++) {
        shuffledPlayers = shufflePlayers(shuffledPlayers);
        let roundMatches = [];

        for (let j = 0; j < numCourts; j++) {
            if (shuffledPlayers.length < 4) break;
            let courtPlayers = shuffledPlayers.splice(0, 4);
            roundMatches.push(`${courtPlayers[0]} & ${courtPlayers[1]} vs ${courtPlayers[2]} & ${courtPlayers[3]}`);
        }
        schedule.push(roundMatches);
    }

    displaySchedule();
}

// 🔹 Display Players 🔹
function displayPlayers() {
    const playerGrid = document.getElementById("playerGrid");
    const playerCount = document.getElementById("playerCount");
    playerGrid.innerHTML = "";
    playerCount.textContent = `(${players.length})`;

    players.forEach((player, index) => {
        let div = document.createElement("div");
        div.className = "player-item";
        div.innerHTML = `${player} <button class="remove-btn" onclick="removePlayer(${index})">❌</button>`;
        playerGrid.appendChild(div);
    });
}

// 🔹 Display Schedule 🔹
function displaySchedule() {
    const scheduleBody = document.getElementById("scheduleBody");
    scheduleBody.innerHTML = "";
    
    schedule.forEach((round, index) => {
        let row = `<tr><td>Round ${index + 1}</td>`;
        round.forEach(court => row += `<td>${court}</td>`);
        row += `</tr>`;
        scheduleBody.innerHTML += row;
    });
}

// 🔹 Utility: Shuffle Players 🔹
function shufflePlayers(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// 🔹 Print Schedule 🔹
function printSchedule() {
    let scheduleHTML = document.getElementById("matchTable").outerHTML;
    let newWindow = window.open("", "_blank");
    newWindow.document.write(`
        <html>
        <head><title>Print Schedule</title></head>
        <body>
            <h2>Match Schedule</h2>
            ${scheduleHTML}
            <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
        </html>
    `);
    newWindow.document.close();
}

// 🔹 Event Listeners 🔹
document.getElementById("playerName").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addPlayer();
    }
});
document.getElementById("numCourts").addEventListener("input", updateSettings);
document.getElementById("numRounds").addEventListener("input", updateSettings);

// Load players from Firestore on startup
loadPlayers();