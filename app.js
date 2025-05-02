console.log("Hello, This is a Blockchain project");
alert("💸 Welcome To CHAIN-VAULT DAPP");

// Define the correct password
const correctPassword = "1234"; // You can change this

// Function to prompt until the correct password is entered
function askPasswordUntilCorrect() {
  let enteredPassword = "";

  while (enteredPassword !== correctPassword) {
    enteredPassword = prompt("🔐 Enter your wallet password:");

    // If the user presses "Cancel" or enters an empty value
    if (enteredPassword === null || enteredPassword === "") {
      alert("❌ You must enter a password to continue.");
    } else if (enteredPassword === correctPassword) {
      alert("✅ Your password is correct! Access granted.");
      break;  // Exit the loop and grant access
    } else {
      alert("❌ Your password is incorrect. Please try again.");
    }
  }
}

// Call the function after the welcome alert
askPasswordUntilCorrect();

let contract;
let account;

const contractAddress = "0xbdD7894608cF5fF110e3E7b2C398e6FACD9a5dBC"; // Smart contract address
const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "sendFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
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
    stateMutability: "payable",
    type: "receive",
  },
];

let provider;
let signer;
let connected = false;

async function toggleWallet() {
  const button = document.getElementById("walletButton");

  if (!connected) {
    // Connect Wallet
    if (window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      document.getElementById("status").textContent = `⚡Connected: ${address}`;
      button.textContent = "❌ Disconnect Wallet";
      connected = true;
    } else {
      alert("Please install MetaMask to connect your wallet.");
    }
  } else {
    // Disconnect Wallet (simulate)
    provider = null;
    signer = null;
    document.getElementById("status").textContent = "Not connected";
    button.textContent = "🔌 Connect Wallet";
    connected = false;
  }
}


async function checkBalance() {
  const balance = await contract.getBalance();
  const eth = ethers.utils.formatEther(balance);
  document.getElementById("status").innerText =
    "Contract Balance: " + eth + " ETH";
}

// Deposit funds to contract
async function depositFunds() {
  if (!account) return alert("⛔ Connect wallet first.");
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const tx = await signer.sendTransaction({
      to: contractAddress,
      value: ethers.utils.parseEther("0.01"), // Send 0.01 ETH
    });
    await tx.wait();
    checkBalance();
  } catch (err) {
    console.error("Deposit failed:", err);
  }
}

// with drawal money
async function withdrawFunds() {
  if (!contract) return alert("⛔ Connect wallet first.");
  try {
    const tx = await contract.withdraw(ethers.utils.parseEther("0.01")); // Withdraw 0.01 ETH from contract
    await tx.wait();
    checkBalance();
  } catch (err) {
    console.error("Withdraw failed:", err);
  }
}

// Send funds from contract to another address
async function sendFundsToAccount(recipient, amount) {
  if (!contract) return alert("⛔ Connect wallet first.");
  try {
    const tx = await contract.sendFunds(
      recipient,
      ethers.utils.parseEther(amount)
    );
    await tx.wait();
    console.log("Funds sent to:", recipient);
    checkBalance();
  } catch (err) {
    console.error("Send funds failed:", err);
    alert("Transaction failed. Check console for details.");
  }
}

// Triggered from form
async function handleSendFunds() {
  const recipient = document.getElementById("recipient").value;
  const amount = document.getElementById("amount").value;

  if (!ethers.utils.isAddress(recipient)) {
    alert("❌ Invalid recipient address.");
    return;
  }

  if (isNaN(amount) || parseFloat(amount) <= 0) {
    alert("❌ Enter a valid amount.");
    return;
  }

  await sendFundsToAccount(recipient, amount);
}

const allTransactions = [
  { to: "0x52676f0b841d7b40740ced9a218de532da9ba640", amount: "0.01", date: "2025-04-30" },
  { to: "0xbdD7894608cF5fF110e3E7b2C398e6FACD9a5dBC", amount: "0.01", date: "2025-04-30" },
  { to: "0xbdD7894608cF5fF110e3E7b2C398e6FACD9a5dBC", amount: "0.01", date: "2025-04-30" },
  { to: "0x52676f0b841d7b40740ced9a218de532da9ba640", amount: "0.01", date: "2025-04-30" },
  { to: "0xbdD7894608cF5fF110e3E7b2C398e6FACD9a5dBC", amount: "0.01", date: "2025-04-30" },
  { to: "0x52676f0b841d7b40740ced9a218de532da9ba640", amount: "0.01", date: "2025-04-30" },
  { to: "0xbdD7894608cF5fF110e3E7b2C398e6FACD9a5dBC", amount: "0.01", date: "2025-04-30" },
  { to: "0xbdD7894608cF5fF110e3E7b2C398e6FACD9a5dBC", amount: "0.01", date: "2025-04-29" },
  { to: "0x52676f0b841d7b40740ced9a218de532da9ba640", amount: "0.01", date: "2025-04-29" },
];

async function downloadTransactions() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(" Transaction Receipt", 15, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 30);
  doc.line(15, 32, 195, 32);

  let y = 40;
  allTransactions.forEach((tx, i) => {
    doc.setFont("helvetica", "bold");
    doc.text(`Transaction #${i + 1}`, 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(`To Address : ${tx.to}`, 20, y + 8);
    doc.text(`Amount     : ${tx.amount} ETH`, 20, y + 16);
    doc.text(`Date       : ${tx.date}`, 20, y + 24);
    doc.line(15, y + 30, 195, y + 30);
    y += 38;

    // Auto add new page if needed
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("All_Transactions.pdf");
}
// Set up background animation
const bg = document.getElementById("animated-background");
const colors = ["#6600ff"];
let colorIndex = 0;

setInterval(() => {
  const color1 = colors[colorIndex % colors.length];
  const color2 = colors[(colorIndex + 1) % colors.length];

  // Apply the radial gradient with reduced brightness
  bg.style.background = `radial-gradient(circle, ${color1} 10%, ${color2} 80%)`;
  bg.style.filter = "brightness(0.6)"; // Adjust brightness to 60%

  colorIndex++;
}, 260); // Change every ~80 milliseconds

document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 30;
  const y = (e.clientY / window.innerHeight - 0.5) * 30;
  bg.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
});
