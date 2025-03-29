let web3;
let contract;
let account;

const abi = [
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [],
    name: "checkBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStudentInfo",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "studentID",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "studentName",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

function logOutput(text) {
  document.getElementById("output").textContent = text;
}

document.getElementById("connectBtn").addEventListener("click", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];

    const contractAddress = document
      .getElementById("contractAddress")
      .value.trim();
    contract = new web3.eth.Contract(abi, contractAddress);

    document.getElementById("status").textContent = `Connected: ${account}`;

    getStudentInfo();
  } else {
    alert("Please install MetaMask");
  }
});

document.getElementById("depositBtn").addEventListener("click", async () => {
  const ethAmount = document.getElementById("depositAmount").value;
  const weiAmount = web3.utils.toWei(ethAmount, "ether");

  try {
    await contract.methods.deposit().send({ from: account, value: weiAmount });
    logOutput(`Deposited ${ethAmount} ETH`);
  } catch (err) {
    logOutput(`Error: ${err.message}`);
  }
});

document.getElementById("withdrawBtn").addEventListener("click", async () => {
  const ethAmount = document.getElementById("withdrawAmount").value;
  const weiAmount = web3.utils.toWei(ethAmount, "ether");

  try {
    await contract.methods.withdraw(weiAmount).send({ from: account });
    logOutput(`Withdrew ${ethAmount} ETH`);
  } catch (err) {
    logOutput(`Error: ${err.message}`);
  }
});

document.getElementById("checkBalance").addEventListener("click", async () => {
  try {
    const balance = await contract.methods
      .checkBalance()
      .call({ from: account });
    const ethBalance = web3.utils.fromWei(balance, "ether");
    logOutput(`Balance: ${ethBalance} ETH`);
  } catch (err) {
    logOutput(`Error: ${err.message}`);
  }
});

async function getStudentInfo() {
  try {
    const result = await contract.methods.getStudentInfo().call();
    console.log(result); // ช่วย debug ได้

    // แก้ตรงนี้!
    const studentName = result[0];
    const studentID = result[1];

    document.getElementById("studentName").textContent = studentName;
    document.getElementById("studentID").textContent = studentID;
  } catch (err) {
    logOutput(`Error loading student info: ${err.message}`);
  }
}
