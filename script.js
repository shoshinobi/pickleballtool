// Load players and schedule when the page loads
window.onload = function () {
    loadPlayers();
    generateSchedule();
};

let players = [];
let numRounds = 8;
let numCourts = 5;
let schedule = [];

// 🔹 Save Players to Local Storage 🔹
function savePlayers() {
    localStorage.setItem("players", JSON.stringify(players));
}

// 🔹 Load Players from Local Storage 🔹
function loadPlayers() {
    let savedPlayers = localStorage.getItem("players");
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        displayPlayers();
        generateSchedule();
    }
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

// 🔹 Add Player 🔹
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
        displayPlayers();
        generateSchedule();
    }
    document.getElementById("playerName").value = "";
}

// 🔹 Remove Player 🔹
function removePlayer(index) {
    players.splice(index, 1);
    savePlayers();
    displayPlayers();
    generateSchedule();
}

// 🔹 Clear Players 🔹
function clearPlayers() {
    players = [];
    localStorage.removeItem("players");
    displayPlayers();
    generateSchedule();
}

// 🔹 Handle CSV Upload 🔹
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split("\n").map(line => line.trim().toUpperCase()).filter(line => line);
        players = [...new Set([...players, ...lines])];
        savePlayers();
        displayPlayers();
        generateSchedule();
    };
    reader.readAsText(file);
}

// 🔹 Update Courts & Rounds 🔹
function updateSettings() {
    numCourts = parseInt(document.getElementById("numCourts").value) || numCourts;
    numRounds = parseInt(document.getElementById("numRounds").value) || numRounds;

    if (numCourts < 1) numCourts = 1;
    if (numCourts > 10) numCourts = 10;
    if (numRounds < 1) numRounds = 1;
    if (numRounds > 20) numRounds = 20;

    generateSchedule();
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

// 🔹 Utility: Shuffle Players 🔹
function shufflePlayers(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// 🔹 Event Listeners 🔹
document.getElementById("playerName").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addPlayer();
    }
});
document.getElementById("csvUpload").addEventListener("change", handleFileUpload);
document.getElementById("numCourts").addEventListener("input", updateSettings);
document.getElementById("numRounds").addEventListener("input", updateSettings);