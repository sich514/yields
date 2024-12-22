import {
  createWalletClient,
  createPublicClient,
  custom,
  encodeFunctionData,
  erc20Abi,
} from "viem";
import { mainnet } from "viem/chains";

const DSR_MANAGER_ADDRESS = "0x373238337Bfe1146fb49989fc222523f83081dDb";
const DSR_ABI = [
  {
    constant: false,
    inputs: [{ internalType: "address", name: "usr", type: "address" }],
    name: "daiBalance",
    outputs: [{ internalType: "uint256", name: "wad", type: "uint256" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    constant: false,
    inputs: [
      { internalType: "address", name: "dst", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "exit",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },

  {
    constant: false,
    inputs: [
      { internalType: "address", name: "dst", type: "address" },
      { internalType: "uint256", name: "wad", type: "uint256" },
    ],
    name: "join",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

function getWalletClient(address, provider) {
  return createWalletClient({
    account: address,
    chain: mainnet,
    transport: custom(provider),
  });
}

function getPublicClient(provider) {
  return createPublicClient({
    chain: 1,
    transport: custom(provider),
  });
}

export async function isDepositApproved(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  const publicClient = getPublicClient(await privyWallet.getEthereumProvider());
  const allowance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [privyWallet.address, DSR_MANAGER_ADDRESS],
  });

  return allowance >= amount;
}

export async function approveDeposit(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  const walletClient = getWalletClient(
    privyWallet.address,
    await privyWallet.getEthereumProvider()
  );
  const publicClient = getPublicClient(await privyWallet.getEthereumProvider());

  const { request } = await publicClient.simulateContract({
    account: privyWallet.address,
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, amount],
  });
  const hash = await walletClient.writeContract(request);

  return hash;
}

export async function deposit(privyWallet, chainId, contractAddress, amount) {
  // Sign and broadcast the transaction
  const walletClient = getWalletClient(
    privyWallet.address,
    await privyWallet.getEthereumProvider()
  );
  const txData = encodeFunctionData({
    abi: DSR_ABI,
    functionName: "join",
    args: [privyWallet.address, amount],
  });
  const hash = await walletClient.sendTransaction({
    data: txData,
    to: DSR_MANAGER_ADDRESS,
  });

  console.log("hash", hash);

  return hash;
}

export async function depositable(privyWallet, chainId, token) {
  const publicClient = getPublicClient(await privyWallet.getEthereumProvider());

  const balance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [privyWallet.address],
  });

  console.log("balance", balance);

  return balance;
}

export async function withdraw(privyWallet, chainId, contractAddress, amount) {
  // Sign and broadcast the transaction
  const walletClient = getWalletClient(
    privyWallet.address,
    await privyWallet.getEthereumProvider()
  );
  const txData = encodeFunctionData({
    abi: DSR_ABI,
    functionName: "exit",
    args: [privyWallet.address, amount],
  });
  const hash = await walletClient.sendTransaction({
    data: txData,
    to: DSR_MANAGER_ADDRESS,
  });

  console.log("hash", hash);

  return hash;
}

export async function withdrawable(privyWallet, chainId, contractAddress) {
  const publicClient = getPublicClient(await privyWallet.getEthereumProvider());

  const { result } = await publicClient.simulateContract({
    address: DSR_MANAGER_ADDRESS,
    abi: DSR_ABI,
    functionName: "daiBalance",
    args: [privyWallet.address],
  });

  return result;
}

export async function isWithdrawApproved(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  return true;
}
