import { Pool, UiPoolDataProvider } from "@aave/contract-helpers";
import {
  createWalletClient,
  createPublicClient,
  custom,
  formatUnits,
  extractChain,
  erc20Abi,
} from "viem";
import { mainnet, base, arbitrum, sepolia } from "viem/chains";
import { useWallets } from "@privy-io/react-auth";
import {
  AaveV3Ethereum,
  AaveV3Sepolia,
  AaveV3Arbitrum,
  AaveV3Base,
} from "@bgd-labs/aave-address-book";
const ETH_MOCK_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

function getAddressBook(chainId) {
  const addressBooks = [
    AaveV3Ethereum,
    AaveV3Sepolia,
    AaveV3Arbitrum,
    AaveV3Base,
  ];
  return addressBooks.find((addressBook) => addressBook.CHAIN_ID === chainId);
}

function getWalletClient(address, chainId, provider) {
  const chain = extractChain({
    chains: [mainnet, base, arbitrum, sepolia],
    id: chainId,
  });

  return createWalletClient({
    account: address,
    chain: chain,
    transport: custom(provider),
  });
}

function getPublicClient(chainId, provider) {
  const chain = extractChain({
    chains: [mainnet, base, arbitrum, sepolia],
    id: chainId,
  });

  return createPublicClient({
    chain: chain,
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
  const addressBook = getAddressBook(chainId);

  const publicClient = getPublicClient(
    chainId,
    await privyWallet.getEthereumProvider()
  );

  const allowance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [privyWallet.address, addressBook.POOL],
  });

  console.log("allowance", allowance);
  console.log("amount", amount);

  return allowance >= amount;
}

export async function approveDeposit(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  const addressBook = getAddressBook(chainId);

  const walletClient = getWalletClient(
    privyWallet.address,
    chainId,
    await privyWallet.getEthereumProvider()
  );
  const publicClient = getPublicClient(
    chainId,
    await privyWallet.getEthereumProvider()
  );

  const { request } = await publicClient.simulateContract({
    account: privyWallet.address,
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [addressBook.POOL, amount],
  });
  const hash = await walletClient.writeContract(request);

  return hash;
}

export async function deposit(privyWallet, chainId, contractAddress, amount) {
  const addressBook = getAddressBook(chainId);

  const pool = new Pool(await privyWallet.getEthersProvider(), {
    POOL: addressBook.POOL,
    WETH_GATEWAY: addressBook.WETH_GATEWAY,
  });

  const poolDataProvider = new UiPoolDataProvider({
    uiPoolDataProviderAddress: addressBook.UI_POOL_DATA_PROVIDER,
    provider: await privyWallet.getEthersProvider(),
    chainId: chainId,
  });

  const reserves = await poolDataProvider.getReservesHumanized({
    lendingPoolAddressProvider: addressBook.POOL_ADDRESSES_PROVIDER,
  });

  console.log("reserves", reserves);

  const decimals = reserves.reservesData.find(
    (reserve) => reserve.underlyingAsset == contractAddress.toLowerCase()
  ).decimals;

  const tx = await pool.supply({
    user: privyWallet.address,
    reserve: contractAddress,
    amount: formatUnits(amount, decimals),
  });

  console.log("tx", tx);

  const extendedTxData = await tx[0].tx();
  console.log("extendedTxData", extendedTxData);
  const { from, ...txData } = extendedTxData;
  console.log("txData", txData);
  console.log("from", from);

  const walletClient = getWalletClient(
    privyWallet.address,
    chainId,
    await privyWallet.getEthereumProvider()
  );
  const hash = await walletClient.sendTransaction({
    ...txData,
  });

  console.log("hash", hash);

  return hash;
}

export async function depositable(privyWallet, chainId, token) {
  const provider = await privyWallet.getEthereumProvider();
  const publicClient = createPublicClient({
    chain: extractChain({
      chains: [mainnet, base, arbitrum, sepolia],
      id: chainId,
    }),
    transport: custom(provider),
  });
  // Token is ETH
  if (token == ETH_MOCK_ADDRESS) {
    console.log("ETH");

    console.log("chainId", chainId);
    console.log("publicClient", publicClient);
    console.log("privyWallet.address", privyWallet.address);
    const balance = await publicClient.getBalance({
      address: privyWallet.address,
    });
    console.log("balance", balance);
    return balance;
  } else {
    console.log("ERC20");

    const balance = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [privyWallet.address],
    });

    return balance;
  }
}

export async function isWithdrawApproved(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  const addressBook = getAddressBook(chainId);

  const publicClient = getPublicClient(
    chainId,
    await privyWallet.getEthereumProvider()
  );

  const poolDataProvider = new UiPoolDataProvider({
    uiPoolDataProviderAddress: addressBook.UI_POOL_DATA_PROVIDER,
    provider: await privyWallet.getEthersProvider(),
    chainId: chainId,
  });

  console.log("poolDataProvider", poolDataProvider);
  console.log("UI_POOL_DATA_PROVIDER", addressBook.UI_POOL_DATA_PROVIDER);

  const reserves = await poolDataProvider.getReservesHumanized({
    lendingPoolAddressProvider: addressBook.POOL_ADDRESSES_PROVIDER,
  });

  console.log("reserves", reserves);

  const aTokenAddress = reserves.reservesData.find(
    (reserve) => reserve.underlyingAsset == token.toLowerCase()
  ).aTokenAddress;

  const allowance = await publicClient.readContract({
    address: aTokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [privyWallet.address, addressBook.POOL],
  });

  console.log("allowance", allowance);
  console.log("amount", amount);

  return allowance >= amount;
}

export async function approveWithdraw(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  const addressBook = getAddressBook(chainId);

  const poolDataProvider = new UiPoolDataProvider({
    uiPoolDataProviderAddress: addressBook.UI_POOL_DATA_PROVIDER,
    provider: await privyWallet.getEthersProvider(),
    chainId: chainId,
  });

  console.log("poolDataProvider", poolDataProvider);
  console.log("UI_POOL_DATA_PROVIDER", addressBook.UI_POOL_DATA_PROVIDER);

  const reserves = await poolDataProvider.getReservesHumanized({
    lendingPoolAddressProvider: addressBook.POOL_ADDRESSES_PROVIDER,
  });

  console.log("reserves", reserves);

  const aTokenAddress = reserves.reservesData.find(
    (reserve) => reserve.underlyingAsset == token.toLowerCase()
  ).aTokenAddress;

  const walletClient = getWalletClient(
    privyWallet.address,
    chainId,
    await privyWallet.getEthereumProvider()
  );
  const publicClient = getPublicClient(
    chainId,
    await privyWallet.getEthereumProvider()
  );

  const { request } = await publicClient.simulateContract({
    account: privyWallet.address,
    address: aTokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [addressBook.POOL, amount],
  });
  const hash = await walletClient.writeContract(request);

  return hash;
}

export async function withdraw(privyWallet, chainId, contractAddress, amount) {
  const addressBook = getAddressBook(chainId);

  const pool = new Pool(await privyWallet.getEthersProvider(), {
    POOL: addressBook.POOL,
    WETH_GATEWAY: addressBook.WETH_GATEWAY,
  });

  const poolDataProvider = new UiPoolDataProvider({
    uiPoolDataProviderAddress: addressBook.UI_POOL_DATA_PROVIDER,
    provider: await privyWallet.getEthersProvider(),
    chainId: chainId,
  });

  const reserves = await poolDataProvider.getReservesHumanized({
    lendingPoolAddressProvider: addressBook.POOL_ADDRESSES_PROVIDER,
  });

  console.log("reserves", reserves);

  const decimals = reserves.reservesData.find(
    (reserve) => reserve.underlyingAsset == contractAddress.toLowerCase()
  ).decimals;

  const tx = await pool.withdraw({
    user: privyWallet.address,
    reserve: contractAddress,
    amount: formatUnits(amount, decimals),
    aTokenAddress:
      contractAddress == ETH_MOCK_ADDRESS && addressBook.ASSETS.WETH.A_TOKEN,
  });

  console.log("tx", tx);

  const extendedTxData = await tx[0].tx();
  console.log("extendedTxData", extendedTxData);
  const { from, ...txData } = extendedTxData;
  console.log("txData", txData);
  console.log("from", from);

  const walletClient = getWalletClient(
    privyWallet.address,
    chainId,
    await privyWallet.getEthereumProvider()
  );
  const hash = await walletClient.sendTransaction({
    ...txData,
  });

  console.log("hash", hash);

  return hash;
}

export async function withdrawable(privyWallet, chainId, contractAddress) {
  const addressBook = getAddressBook(chainId);
  var aTokenAddress = "";
  //Token is ETH
  if (contractAddress == ETH_MOCK_ADDRESS) {
    aTokenAddress = addressBook.ASSETS.WETH.A_TOKEN;
  } else {
    const poolDataProvider = new UiPoolDataProvider({
      uiPoolDataProviderAddress: addressBook.UI_POOL_DATA_PROVIDER,
      provider: await privyWallet.getEthersProvider(),
      chainId: chainId,
    });

    console.log("poolDataProvider", poolDataProvider);
    console.log("UI_POOL_DATA_PROVIDER", addressBook.UI_POOL_DATA_PROVIDER);

    const reserves = await poolDataProvider.getReservesHumanized({
      lendingPoolAddressProvider: addressBook.POOL_ADDRESSES_PROVIDER,
    });

    console.log("reserves", reserves);

    aTokenAddress = reserves.reservesData.find(
      (reserve) => reserve.underlyingAsset == contractAddress.toLowerCase()
    ).aTokenAddress;
  }

  const provider = await privyWallet.getEthereumProvider();
  const publicClient = createPublicClient({
    chain: extractChain({
      chains: [mainnet, base, arbitrum, sepolia],
      id: chainId,
    }),
    transport: custom(provider),
  });

  console.log("erc20Abi", erc20Abi);

  const balance = await publicClient.readContract({
    address: aTokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [privyWallet.address],
  });

  return balance;
}
