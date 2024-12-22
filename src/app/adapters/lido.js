import {
  createWalletClient,
  createPublicClient,
  custom,
  encodeFunctionData,
  erc20Abi,
} from "viem";
import { mainnet } from "viem/chains";
import {
  LidoSDK,
  LidoSDKCore,
  StakeStageCallback,
  TransactionCallbackStage,
  SDKError,
} from "@lidofinance/lido-ethereum-sdk";

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
  return true;
}

export async function deposit(privyWallet, chainId, contractAddress, amount) {
  // Sign and broadcast the transaction
  const walletClient = getWalletClient(
    privyWallet.address,
    await privyWallet.getEthereumProvider()
  );

  const sdk = new LidoSDK({
    chainId: 1,
    rpcUrls: [mainnet.rpcUrls.default.http[0]],
    web3Provider: walletClient,
  });

  const callback = ({ stage, payload }) => {
    switch (stage) {
      case TransactionCallbackStage.SIGN:
        console.log("wait for sign");
        break;
      case TransactionCallbackStage.RECEIPT:
        console.log("wait for receipt");
        console.log(payload, "transaction hash");
        break;
      case TransactionCallbackStage.CONFIRMATION:
        console.log("wait for confirmation");
        console.log(payload, "transaction receipt");
        break;
      case TransactionCallbackStage.DONE:
        console.log("done");
        console.log(payload, "transaction confirmations");
        break;
      case TransactionCallbackStage.ERROR:
        console.log("error");
        console.log(payload, "error object with code and message");
        break;
      default:
    }
  };

  console.log("amount", amount);

  try {
    const stakeTx = await sdk.stake.stakeEth({
      value: amount,
      callback: callback,
    });

    console.log("stakeTx", stakeTx);

    return stakeTx.hash;
  } catch (error) {
    console.log(error.message, error.code);
  }
}

export async function depositable(privyWallet, chainId, token) {
  const publicClient = getPublicClient(await privyWallet.getEthereumProvider());

  const balance = await publicClient.getBalance({
    address: privyWallet.address,
  });

  return balance;
}

export async function createUnlockRequest(privyWallet, chainId, amount) {
  // Sign and broadcast the transaction
  const walletClient = getWalletClient(
    privyWallet.address,
    await privyWallet.getEthereumProvider()
  );

  const sdk = new LidoSDK({
    chainId: 1,
    rpcUrls: [mainnet.rpcUrls.default.http[0]],
    web3Provider: walletClient,
  });

  const callback = ({ stage, payload }) => {
    switch (stage) {
      case TransactionCallbackStage.PERMIT:
        console.log("wait for permit");
        break;
      case TransactionCallbackStage.GAS_LIMIT:
        console.log("wait for gas limit");
        break;
      case TransactionCallbackStage.SIGN:
        console.log("wait for sign");
        break;
      case TransactionCallbackStage.RECEIPT:
        console.log("wait for receipt");
        console.log(payload, "transaction hash");
        break;
      case TransactionCallbackStage.CONFIRMATION:
        console.log("wait for confirmation");
        console.log(payload, "transaction receipt");
        break;
      case TransactionCallbackStage.DONE:
        console.log("done");
        console.log(payload, "transaction confirmations");
        break;
      case TransactionCallbackStage.MULTISIG_DONE:
        console.log("multisig_done");
        console.log(payload, "transaction confirmations");
        break;
      case TransactionCallbackStage.ERROR:
        console.log("error");
        console.log(payload, "error object with code and message");
        break;
      default:
    }
  };

  try {
    const requestTx = await sdk.withdraw.request.requestWithdrawalWithPermit({
      amount,
      token: "stETH",
      callback,
      account: privyWallet.address,
    });

    return requestTx.hash;
  } catch (error) {
    console.log(error.message, error.code);
  }
}

export async function unlockable(privyWallet, chainId) {
  const sdk = new LidoSDK({
    chainId: 1,
    rpcUrls: [mainnet.rpcUrls.default.http[0]],
  });

  const stETHBalance = await sdk.steth.balance(privyWallet.address);

  console.log("stETHBalance", stETHBalance);

  return stETHBalance;
}

export async function unlockRequests(privyWallet, chainId) {
  console.log("privyWallet", privyWallet);
  const sdk = new LidoSDK({
    chainId: 1,
    rpcUrls: [mainnet.rpcUrls.default.http[0]],
  });

  try {
    const requestTx = await sdk.withdraw.requestsInfo.getWithdrawalRequestsInfo(
      {
        account: privyWallet.address,
      }
    );

    console.log("lido adapter: unlockRequests", requestTx);

    var unlockRequests = [];

    for (var i = 0; i < requestTx.claimableInfo.claimableRequests.length; i++) {
      unlockRequests.push({
        amount: requestTx.claimableInfo.claimableRequests[i].amountOfStETH,
        timestamp: Number(
          requestTx.claimableInfo.claimableRequests[i].timestamp
        ),
        status: "withdrawable",
      });
    }

    for (var i = 0; i < requestTx.pendingInfo.pendingRequests.length; i++) {
      unlockRequests.push({
        amount: requestTx.pendingInfo.pendingRequests[i].amountOfStETH,
        timestamp: Number(requestTx.pendingInfo.pendingRequests[i].timestamp),
        status: "pending",
      });
    }

    console.log("unlockRequests", unlockRequests);

    return unlockRequests;
  } catch (error) {
    console.log(error.message, error.code);
  }
}

export async function withdraw(privyWallet, chainId, contractAddress, amount) {
  // Sign and broadcast the transaction
  const walletClient = getWalletClient(
    privyWallet.address,
    await privyWallet.getEthereumProvider()
  );

  const sdk = new LidoSDK({
    chainId: 1,
    rpcUrls: [mainnet.rpcUrls.default.http[0]],
    web3Provider: walletClient,
  });

  const callback = ({ stage, payload }) => {
    switch (stage) {
      case TransactionCallbackStage.GAS_LIMIT:
        console.log("wait for gas limit");
        break;
      case TransactionCallbackStage.SIGN:
        console.log("wait for sign");
        break;
      case TransactionCallbackStage.RECEIPT:
        console.log("wait for receipt");
        console.log(payload, "transaction hash");
        break;
      case TransactionCallbackStage.CONFIRMATION:
        console.log("wait for confirmation");
        console.log(payload, "transaction receipt");
        break;
      case TransactionCallbackStage.DONE:
        console.log("done");
        console.log(payload, "transaction confirmations");
        break;
      case TransactionCallbackStage.ERROR:
        console.log("error");
        console.log(payload, "error object with code and message");
        break;
      default:
    }
  };

  try {
    const requestsTx =
      await sdk.withdraw.requestsInfo.getClaimableRequestsETHByAccount({
        account: privyWallet.address,
      });

    console.log("requestsTx", requestsTx);

    var requestsIds = [];
    var requestsEthSum = 0n;

    for (
      var i = 0;
      i < requestsTx.requests.length || requestsEthSum > BigInt(amount);
      i++
    ) {
      requestsIds.push(requestsTx.requests[i].id);
      requestsEthSum += requestsTx.ethByRequests[i];
    }

    if (requestsIds.length > 0) {
      const claimTx = await sdk.withdraw.claim.claimRequests({
        requestsIds,
        callback,
      });

      return claimTx.hash;
    } else {
      throw new Error("No requests to claim");
    }
  } catch (error) {
    console.log(error.message, error.code);
  }
}

export async function withdrawable(privyWallet, chainId, contractAddress) {
  const sdk = new LidoSDK({
    chainId: 1,
    rpcUrls: [mainnet.rpcUrls.default.http[0]],
  });

  try {
    const requestTx = await sdk.withdraw.requestsInfo.getWithdrawalRequestsInfo(
      {
        account: privyWallet.address,
      }
    );

    console.log("requestTx", requestTx);
    console.log("withdrawableAnswer", requestTx.claimableETH.ethSum);
    return requestTx.claimableETH.ethSum;
  } catch (error) {
    console.log(error.message, error.code);
  }
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
