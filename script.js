// Load players and schedule when the page loads
window.onload = function () {
    loadPlayers();
    generateSchedule();
};

let players = [];
let numRounds = 8;
let numCourts = 5;
let schedule = [];

function savePlayers() {
    localStorage.setItem("players", JSON.stringify(players));
}

function loadPlayers() {
    let savedPlayers = localStorage.getItem("players");
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        displayPlayers();
        generateSchedule();
    }
}

function generateSchedule() {
    const scheduleBody = document.getElementById("scheduleBody");
    const tableHeader = document.getElementById("tableHeader");

    if (players.length < 4) {
        scheduleBody.innerHTML = "<tr><td colspan='" + (numCourts + 1) + "'>Not enough players to create matches.</td></tr>";
        return;
    }

    let playerPlayCounts = {};
    players.forEach(player => playerPlayCounts[player] = 0);

    schedule = [];

    for (let i = 0; i < numRounds; i++) {
        let roundMatches = [];
        let availablePlayers = [...players];

        availablePlayers = shufflePlayers(availablePlayers);

        let sittingOut = determineSitOuts(availablePlayers, playerPlayCounts);
        availablePlayers = availablePlayers.filter(player => !sittingOut.includes(player));

        while (availablePlayers.length >= 4) {
            let courtPlayers = getBalancedPairing(availablePlayers);
            courtPlayers.forEach(player => playerPlayCounts[player]++);
            roundMatches.push(`${courtPlayers[0]} & ${courtPlayers[1]} vs ${courtPlayers[2]} & ${courtPlayers[3]}`);
        }

        if (sittingOut.length > 0) {
            roundMatches.push(`Sitting Out: ${sittingOut.join(", ")}`);
        }

        schedule.push(roundMatches);
    }

    displaySchedule();
    displayPlayers();
}

function shufflePlayers(playerList) {
    for (let i = playerList.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [playerList[i], playerList[j]] = [playerList[j], playerList[i]];
    }
    return playerList;
}

function getBalancedPairing(playerList) {
    let team1 = [playerList.shift(), playerList.pop()];
    let team2 = [playerList.shift(), playerList.pop()];
    return [...team1, ...team2];
}

function determineSitOuts(playerList, playCounts) {
    let totalPlayers = playerList.length;
    let playersNeeded = numCourts * 4;
    let sitOuts = [];

    if (totalPlayers % 4 === 0) return sitOuts;

    let numToSitOut = totalPlayers % 4;
    let sortedPlayers = [...playerList].sort((a, b) => playCounts[a] - playCounts[b]);

    for (let i = 0; i < numToSitOut; i++) {
        sitOuts.push(sortedPlayers[i]);
        playCounts[sortedPlayers[i]]++;
    }

    return sitOuts;
}

function displaySchedule() {
    const scheduleBody = document.getElementById("scheduleBody");
    const tableHeader = document.getElementById("tableHeader");

    scheduleBody.innerHTML = "";
    tableHeader.innerHTML = "<th>Round</th>";

    for (let i = 1; i <= numCourts; i++) {
        tableHeader.innerHTML += `<th>Court ${i}</th>`;
    }

    let hasSitOuts = schedule.some(round => round.some(match => match.startsWith("Sitting Out")));
    if (hasSitOuts) {
        tableHeader.innerHTML += `<th>Sitting Out</th>`;
    }

    schedule.forEach((round, index) => {
        let row = `<tr><td>Round ${index + 1}</td>`;
        round.forEach(court => {
            row += `<td>${court}</td>`;
        });
        row += `</tr>`;
        scheduleBody.innerHTML += row;
    });
}

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

function removePlayer(index) {
    players.splice(index, 1);
    savePlayers();
    displayPlayers();
    generateSchedule();
}

function clearPlayers() {
    players = [];
    localStorage.removeItem("players");
    displayPlayers();
    generateSchedule();
}

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

function updateSettings() {
    numCourts = parseInt(document.getElementById("numCourts").value) || numCourts;
    numRounds = parseInt(document.getElementById("numRounds").value) || numRounds;

    if (numCourts < 1) numCourts = 1;
    if (numCourts > 10) numCourts = 10;
    if (numRounds < 1) numRounds = 1;
    if (numRounds > 20) numRounds = 20;

    generateSchedule();
}

function printSchedule() {
    let scheduleHTML = document.getElementById("matchTable").outerHTML;
    let newWindow = window.open("", "_blank");
    newWindow.document.write(`
        <html>
        <head><title>Print Schedule</title></head>
        <body>
            <h2>Match Schedule</h2>
            ${scheduleHTML}
            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `);
    newWindow.document.close();
}

document.getElementById("playerName").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addPlayer();
    }
});

document.getElementById("csvUpload").addEventListener("change", handleFileUpload);

document.getElementById("numCourts").addEventListener("input", updateSettings);
document.getElementById("numRounds").addEventListener("input", updateSettings);