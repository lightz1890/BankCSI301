// script.js

let web3;
let contract;
let account;

//const INFURA_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"; // <-- ใส่ค่า PROJECT_ID ของคุณ
//const PRIVATE_KEY = "YOUR_PRIVATE_KEY"; // <-- ใส่ Private Key ของคุณ
const INFURA_URL = "https://holesky.infura.io/v3/1321eaaa9e1b48a1b6bff4b68c49e27d"; // <-- ใส่ค่า PROJECT_ID ของคุณ
const PRIVATE_KEY = "4689bfe942dddc51b5c29ffe38aa99d1434e33076349f840ab099adc32f30edb"; // <-- ใส่ Private Key ของคุณ
const abi = [
    { "inputs": [], "name": "status", "outputs": [{ "internalType": "bool", "name": "open_", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "scores", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "ballots", "outputs": [{ "internalType": "uint256", "name": "option", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "option", "type": "uint256" }], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "open", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "close", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

const maxOption = 5; // ปรับตาม contract ของคุณ

function logOutput(text) {
    document.getElementById('output').textContent = text;
}

document.getElementById('connectBtn').addEventListener('click', async () => {
    const contractAddress = document.getElementById('contractAddress').value.trim();
    if (!contractAddress) {
        alert('Please enter the contract address');
        return;
    }

    // เชื่อมต่อกับ Infura
    web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));

    // สร้าง instance ของสัญญา
    contract = new web3.eth.Contract(abi, contractAddress);

    // ตรวจสอบว่า Private Key ถูกต้องและสามารถดึง account มาได้หรือไม่
    account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);
    document.getElementById('status').textContent = `Connected via Infura with account: ${account.address}`;

    // เรียกฟังก์ชันแสดงปุ่มโหวตและคะแนน
    renderVoteButtons();
    showScores();
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
        const tx = contract.methods.vote(option);
        const gas = await tx.estimateGas({ from: account.address });
        const gasPrice = await web3.eth.getGasPrice();
        const data = tx.encodeABI();

        const txData = {
            from: account.address,
            to: contract.options.address,
            data: data,
            gas: gas,
            gasPrice: gasPrice,
        };

        // เซ็นธุรกรรมด้วย Private Key
        const signedTx = await web3.eth.accounts.signTransaction(txData, PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        logOutput(`You voted for option ${option}. Transaction hash: ${receipt.transactionHash}`);
        showScores();
    } catch (err) {
        logOutput(`Error: ${err.message}`);
    }
}

document.getElementById('checkBallot').addEventListener('click', async () => {
    try {
        const option = await contract.methods.ballots().call();
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
        logOutput(`Error: ${
