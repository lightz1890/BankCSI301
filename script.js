// script.js

let web3;
let contract;
let account;

const abi = [
    { "inputs": [], "name": "status", "outputs": [{ "internalType": "bool", "name": "open_", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "scores", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "ballots", "outputs": [{ "internalType": "uint256", "name": "option", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "option", "type": "uint256" }], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "open", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "close", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const maxOption = 5; // Adjust based on your contract deployment _max

function logOutput(text) {
    document.getElementById('output').textContent = text;
}

document.getElementById('connectBtn').addEventListener('click', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        account = accounts[0];

        const contractAddress = document.getElementById('contractAddress').value.trim();
        contract = new web3.eth.Contract(abi, contractAddress);

        document.getElementById('status').textContent = `Connected: ${account}`;

        renderVoteButtons();
        showScores();
    } else {
        alert('Please install MetaMask');
    }
});

function renderVoteButtons() {
    const container = document.getElementById('voteOptions');
    container.innerHTML = '';
    for (let i = 1; i <= maxOption; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-success';
        btn.textContent = `Vote ${i}`;
        btn.onclick = () => vote(i);
        container.appendChild(btn);
    }
}

async function vote(option) {
    try {
        await contract.methods.vote(option).send({ from: account });
        logOutput(`You voted for option ${option}`);
        showScores();
    } catch (err) {
        logOutput(`Error: ${err.message}`);
    }
}

document.getElementById('checkBallot').addEventListener('click', async () => {
    try {
        const option = await contract.methods.ballots().call({ from: account });
        logOutput(`You voted for option: ${option}`);
    } catch (err) {
        logOutput(`Error: ${err.message}`);
    }
});

document.getElementById('checkScores').addEventListener('click', showScores);

async function showScores() {
    try {
        const scores = await contract.methods.scores().call();
        const list = document.getElementById('scoreList');
        list.innerHTML = '';

        const scoresNumber = scores.map(s => Number(s));
        let maxVotes = Math.max(...scoresNumber.slice(1));

        const chartLabels = [];
        const chartData = [];

        scoresNumber.forEach((score, index) => {
            if (index === 0) return; // Skip index 0
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `Option ${index}: ${score} vote(s)`;
            if (score === maxVotes && score > 0) {
                li.classList.add('list-group-item-success');
            }
            list.appendChild(li);
            chartLabels.push(`Option ${index}`);
            chartData.push(score);
        });

        renderChart(chartLabels, chartData);
    } catch (err) {
        logOutput(`Error: ${err.message}`);
    }
}

function renderChart(labels, data) {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    if (window.scoreChartInstance) {
        window.scoreChartInstance.destroy();
    }
    window.scoreChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Votes',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            }
        }
    });
}

document.getElementById('checkStatus').addEventListener('click', async () => {
    try {
        const isOpen = await contract.methods.status().call();
        logOutput(`Election is currently ${isOpen ? 'OPEN' : 'CLOSED'}`);
    } catch (err) {
        logOutput(`Error: ${err.message}`);
    }
});

document.getElementById('openVote').addEventListener('click', async () => {
    try {
        await contract.methods.open().send({ from: account });
        logOutput('Election opened');
    } catch (err) {
        logOutput(`Error: ${err.message}`);
    }
});

document.getElementById('closeVote').addEventListener('click', async () => {
    try {
        await contract.methods.close().send({ from: account });
        logOutput('Election closed');
    } catch (err) {
        logOutput(`Error: ${err.message}`);
    }
});
