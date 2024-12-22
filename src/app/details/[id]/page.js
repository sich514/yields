"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import {
  Flex,
  Text,
  Button,
  Heading,
  IconButton,
  Card,
  Grid,
  TextField,
  Separator,
  Badge,
  Tooltip,
  RadioCards,
  Callout,
  Table,
  Spinner,
  Box,
} from "@radix-ui/themes";
import { mainnet, base, arbitrum, sepolia } from "viem/chains";
import {
  InfoCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import RiskIndicator from "../../components/riskIndicator";
import { adapterRegistry } from "../../adapters/adapterRegistry";
import { useSettingsContext } from "../../components/SettingsContext";
import React from "react";
import moment from "moment";
import {
  createWalletClient,
  custom,
  extractChain,
  formatUnits,
  parseUnits,
  createPublicClient,
  maxUint256,
} from "viem";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import ApyChart from "../../components/apyChart";

export default function YieldPage({ params }) {
  const settings = useSettingsContext();

  const { ready, wallets } = useWallets();
  const [provider, setProvider] = useState();
  const [selectedTab, setSelectedTab] = useState("1");
  const [initialChainSwitch, setInitialChainSwitch] = useState(false);
  const [depositable, setDepositable] = useState("0");
  const [unlockable, setUnlockable] = useState("0");
  const [unlockAmount, setUnlockAmount] = useState("0");
  const [unlockRequests, setUnlockRequests] = useState([]);
  const [depositAmount, setDepositAmount] = useState("0");
  const [depositApproved, setDepositApproved] = useState(false);
  const [withdrawable, setWithdrawable] = useState("0");
  const [withdrawAmount, setWithdrawAmount] = useState("0");
  const [withdrawApproved, setWithdrawApproved] = useState(false);
  const [yieldsData, setYieldsData] = useState();
  const [yieldDetails, setYieldDetails] = useState();
  const [maturityDate, setMaturityDate] = useState();
  const [txConfirming, setTxConfirming] = useState(false);
  const claimAvailable = false;
  const currentTimestamp = new Date().getTime() / 1000;

  async function getDepositable() {
    console.log("getDepositable");
    const depositable = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].depositable(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.asset.address
    );
    console.log("depositable", depositable);
    setDepositable(depositable);
  }

  async function getDepositApproved() {
    const isDepositApprovedResult = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].isDepositApproved(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.asset.address,
      yieldDetails.contractAddress,
      depositAmount > 0
        ? parseUnits(depositAmount, yieldDetails.asset.decimals)
        : 1
    );

    console.log("isDepositApprovedResult", isDepositApprovedResult);
    console.log("depositAmount", depositAmount);
    // Get approval status
    setDepositApproved(isDepositApprovedResult);
  }

  async function getUnlockable() {
    console.log("getUnlockable");
    const unlockable = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].unlockable(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.contractAddress
    );
    setUnlockable(unlockable);

    console.log("unlockable", unlockable);
  }

  async function getUnlockRequests() {
    const unlockRequests = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].unlockRequests(wallets[0], yieldDetails.chain.chainId);
    setUnlockRequests(unlockRequests);

    console.log("getUnlockRequests", unlockRequests);
  }

  async function getWithdrawable() {
    console.log("getWithdrawable");
    const withdrawable = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].withdrawable(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.contractAddress
    );
    setWithdrawable(withdrawable);

    console.log("withdrawable", withdrawable);
  }

  async function getWithdrawApproved() {
    const isWithdrawApprovedResult = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].isWithdrawApproved(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.asset.address,
      yieldDetails.contractAddress,
      withdrawAmount > 0
        ? parseUnits(withdrawAmount, yieldDetails.asset.decimals)
        : 1
    );

    console.log("isWithdrawApprovedResult", isWithdrawApprovedResult);

    setWithdrawApproved(isWithdrawApprovedResult);
  }

  useEffect(() => {
    console.log("update depositAmount", depositAmount);

    if (yieldDetails) {
      getDepositApproved();
    }
  }, [depositAmount, yieldDetails, wallets]);

  useEffect(() => {
    console.log("update withdrawAmount", withdrawAmount);

    if (yieldDetails) {
      getWithdrawApproved();
    }
  }, [withdrawAmount, yieldDetails, wallets]);

  useEffect(() => {
    async function getProvider() {
      console.log("ready", ready);

      var walletZero = wallets[0];
      console.log("walletZero", walletZero);
      setProvider(await walletZero.getEthereumProvider());
    }

    if (ready && wallets.length > 0 && yieldDetails) {
      getProvider();

      // Get depositable amount
      getDepositable();

      // Get withdrawable amount
      getWithdrawable();

      // Get unlockable amount
      if (yieldDetails.unlockDuration) {
        getUnlockable();
        getUnlockRequests();
      }

      // Chain switch
      if (!initialChainSwitch) {
        switchChain();
        setInitialChainSwitch(true);
      }
    }
  }, [ready, wallets, yieldDetails]);

  useEffect(() => {
    async function fetchData() {
      try {
        const yieldsUrl = settings.testnet
          ? "https://raw.githubusercontent.com/jvalentee/yieldhouse-data/main/data/yieldsTestnet.json"
          : "https://raw.githubusercontent.com/jvalentee/yieldhouse-data/main/data/yields.json";

        const response = await fetch(yieldsUrl);
        if (response.ok) {
          const data = await response.json();
          setYieldsData(data);
          setYieldDetails(data.find((yieldData) => yieldData.id == params.id));
          setMaturityDate(
            new Date(data[params.id].apy.maturityTimestamp * 1000)
          );
        } else {
          console.error("Failed to fetch yields data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching yields data:", error);
      }
    }

    fetchData();
  }, [settings, params.id]);

  async function switchChain() {
    console.log("yieldDetails", yieldDetails);
    console.log("wallets[0]", wallets[0]);
    const walletChainId = wallets[0].chainId;
    console.log("yieldDetails.chain.chainId", yieldDetails.chain.chainId);
    if (walletChainId != yieldDetails.chain.chainId) {
      wallets[0]
        .switchChain(yieldDetails.chain.chainId)
        .then(() => {
          console.log("Switched chain to", yieldDetails.chain.chainId);
        })
        .catch(async (error) => {
          if (error.message.startsWith("Unrecognized chain ID")) {
            console.log("Adding chain to wallet");
            const walletClient = createWalletClient({
              transport: custom(provider),
            });
            // If the chain hasn't been added to the wallet, add it and try again
            await walletClient.addChain({
              chain: extractChain({
                chains: [mainnet, base, arbitrum, sepolia],
                id: yieldDetails.chain.chainId,
              }),
            });
          }
        });
    }
  }

  return (
    <>
      {yieldDetails ? (
        <Flex direction="column">
          <Flex direction="row" justify="center" align="center" gap="6">
            <Image
              src={
                "/images/assets/" +
                yieldDetails.asset.name.toLowerCase() +
                ".svg"
              }
              width={40}
              height={40}
            />
            <Separator orientation="vertical" size="1" />
            <Image
              src={
                "/images/protocols/" +
                yieldDetails.protocol.toLowerCase() +
                ".svg"
              }
              width={240}
              height={120}
            />
          </Flex>
          <Flex
            direction={{
              initial: "column-reverse",
              sm: "row",
            }}
            mt="8"
            gap="8"
          >
            <Flex
              direction="column"
              gap="4"
              width={{
                initial: "100%",
                sm: "50%",
              }}
            >
              <RadioCards.Root
                defaultValue="1"
                size="1"
                columns={
                  claimAvailable || yieldDetails.unlockDuration ? "3" : "2"
                }
                onValueChange={(value) => {
                  console.log(value);
                  setSelectedTab(value);
                }}
              >
                <RadioCards.Item value="1">
                  <Text weight="bold">Deposit</Text>
                </RadioCards.Item>
                {yieldDetails.unlockDuration && (
                  <RadioCards.Item value="2">
                    <Text weight="bold">Unlock</Text>
                  </RadioCards.Item>
                )}
                <RadioCards.Item value="3">
                  <Text weight="bold">Withdraw</Text>
                </RadioCards.Item>
                {claimAvailable && (
                  <RadioCards.Item value="4" disabled={!claimAvailable}>
                    <Text weight="bold">Claim</Text>
                  </RadioCards.Item>
                )}
              </RadioCards.Root>
              {yieldDetails.chain.chainId !=
                wallets[0]?.chainId.substring(
                  wallets[0].chainId.indexOf(":") + 1
                ) && (
                <Callout.Root color="red" role="alert" size="2">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    {wallets[0]
                      ? `Switch to the ${yieldDetails.chain.name} network to see your balance.`
                      : "Connect your wallet to see your balance."}
                  </Callout.Text>
                  {wallets[0] && (
                    <Button
                      size="1"
                      onClick={() => {
                        switchChain();
                      }}
                    >
                      Switch Network
                    </Button>
                  )}
                </Callout.Root>
              )}
              {selectedTab == "1" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Flex direction="column" gap="1">
                      <TextField.Root
                        size="3"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => {
                          console.log(e.target.value);
                          setDepositAmount(e.target.value);
                        }}
                      >
                        <TextField.Slot>
                          <Image
                            src={
                              "/images/assets/" +
                              yieldDetails.asset.name.toLowerCase() +
                              ".svg"
                            }
                            width={20}
                            height={20}
                          />
                        </TextField.Slot>
                      </TextField.Root>
                      <Flex direction="row" justify="end" mx="2">
                        <Text
                          size="1"
                          weight="light"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setDepositAmount(
                              formatUnits(
                                depositable,
                                yieldDetails.asset.decimals
                              )
                            );
                          }}
                        >
                          {"Balance: " +
                            Number(
                              formatUnits(
                                depositable,
                                yieldDetails.asset.decimals
                              )
                            ).toFixed(6) +
                            " " +
                            yieldDetails.asset.name}
                        </Text>
                      </Flex>
                    </Flex>
                    <Separator size="4" />
                    {depositApproved ? (
                      <Button
                        disabled={
                          depositAmount == 0 ||
                          parseUnits(
                            depositAmount,
                            yieldDetails.asset.decimals
                          ) > depositable ||
                          !wallets[0]
                        }
                        onClick={async () => {
                          switchChain();
                          setTxConfirming(true);
                          var hash;

                          try {
                            hash = await adapterRegistry[
                              yieldDetails.protocol.toLowerCase()
                            ].deposit(
                              wallets[0],
                              yieldDetails.chain.chainId,
                              yieldDetails.contractAddress,
                              parseUnits(
                                depositAmount,
                                yieldDetails.asset.decimals
                              )
                            );
                          } catch (error) {
                            console.error("deposit error", error);
                            setTxConfirming(false);
                            return;
                          }

                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chain.chainId,
                            }),
                          });

                          console.log("publicClient", publicClient);
                          console.log("waiting for tx receipt");

                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          setTxConfirming(false);

                          console.log("receipt", receipt);

                          console.log("deposit-tx done");

                          getDepositable();
                          getWithdrawable();
                        }}
                        variant="classic"
                      >
                        {txConfirming ? <Spinner /> : "Deposit"}
                      </Button>
                    ) : (
                      <Button
                        disabled={depositAmount == 0 || !wallets[0]}
                        onClick={async () => {
                          switchChain();
                          setTxConfirming(true);
                          var hash;
                          try {
                            hash = await adapterRegistry[
                              yieldDetails.protocol.toLowerCase()
                            ].approveDeposit(
                              wallets[0],
                              yieldDetails.chain.chainId,
                              yieldDetails.asset.address,
                              yieldDetails.contractAddress,
                              maxUint256
                            );
                          } catch (error) {
                            console.error("approveDeposit error", error);
                            setTxConfirming(false);
                            return;
                          }

                          console.log("hash", hash);
                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chain.chainId,
                            }),
                          });

                          console.log("publicClient", publicClient);

                          console.log("waiting for tx receipt");

                          await publicClient.waitForTransactionReceipt({
                            hash,
                          });

                          await getDepositApproved();

                          setTxConfirming(false);
                        }}
                        variant="classic"
                      >
                        {txConfirming ? <Spinner /> : "Approve"}
                      </Button>
                    )}
                  </Flex>
                </Card>
              )}
              {selectedTab == "2" && (
                <Flex direction="column" gap="4">
                  <Card>
                    <Flex direction="column" gap="4">
                      <Heading size="2">Unlock requests</Heading>
                      {unlockRequests.length > 0 ? (
                        <Table.Root variant="surface">
                          <Table.Body>
                            {unlockRequests.map((unlockRequest, i) => (
                              <Table.Row key={i}>
                                <Table.Cell>
                                  <Flex
                                    direction="row"
                                    gapX="1"
                                    display="inline-flex"
                                  >
                                    <Text size="1">
                                      {Number(
                                        formatUnits(
                                          unlockRequest.amount,
                                          yieldDetails.asset.decimals
                                        )
                                      ).toFixed(6)}
                                    </Text>
                                    <Image
                                      src={
                                        "/images/assets/" +
                                        yieldDetails.asset.name.toLowerCase() +
                                        ".svg"
                                      }
                                      width={15}
                                      height={15}
                                    />
                                  </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                  <Text size="1">
                                    {moment(
                                      unlockRequest.timestamp * 1000
                                    ).fromNow()}
                                  </Text>
                                </Table.Cell>
                                <Table.Cell>
                                  <Text size="1">
                                    {unlockRequest.status
                                      .charAt(0)
                                      .toUpperCase() +
                                      unlockRequest.status.slice(1)}
                                  </Text>
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table.Root>
                      ) : (
                        <Flex direction="column" align="center">
                          <Text size="1">No unlock requests</Text>
                        </Flex>
                      )}
                    </Flex>
                  </Card>
                  <Card>
                    <Flex direction="column" gap="4">
                      <Heading size="2">Create unlock request</Heading>
                      <Flex direction="column" gap="1">
                        <TextField.Root
                          size="3"
                          type="number"
                          value={unlockAmount}
                          onChange={(e) => {
                            console.log(e.target.value);
                            setUnlockAmount(e.target.value);
                          }}
                        >
                          <TextField.Slot>
                            <Image
                              src={
                                "/images/assets/" +
                                yieldDetails.asset.name.toLowerCase() +
                                ".svg"
                              }
                              width={20}
                              height={20}
                            />
                          </TextField.Slot>
                        </TextField.Root>
                        <Flex direction="row" justify="end" mx="2">
                          <Text
                            size="1"
                            weight="light"
                            style={{
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setUnlockAmount(
                                formatUnits(
                                  unlockable,
                                  yieldDetails.asset.decimals
                                )
                              );
                            }}
                          >
                            {"Balance: " +
                              Number(
                                formatUnits(
                                  unlockable,
                                  yieldDetails.asset.decimals
                                )
                              ).toFixed(6) +
                              " " +
                              yieldDetails.asset.name}
                          </Text>
                        </Flex>
                      </Flex>
                      <Separator size="4" />
                      <Button
                        disabled={
                          unlockAmount == 0 ||
                          parseUnits(
                            unlockAmount,
                            yieldDetails.asset.decimals
                          ) > unlockable ||
                          !wallets[0]
                        }
                        onClick={async () => {
                          switchChain();
                          setTxConfirming(true);
                          var hash;

                          try {
                            hash = await adapterRegistry[
                              yieldDetails.protocol.toLowerCase()
                            ].createUnlockRequest(
                              wallets[0],
                              yieldDetails.chain.chainId,
                              parseUnits(
                                unlockAmount,
                                yieldDetails.asset.decimals
                              )
                            );
                          } catch (error) {
                            console.error("unlock error", error);
                            setTxConfirming(false);
                            return;
                          }

                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chain.chainId,
                            }),
                          });

                          console.log("publicClient", publicClient);
                          console.log("waiting for tx receipt");

                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          setTxConfirming(false);

                          console.log("receipt", receipt);

                          console.log("deposit-tx done");

                          getUnlockable();
                          getUnlockRequests();
                        }}
                        variant="classic"
                      >
                        {txConfirming ? <Spinner /> : "Unlock"}
                      </Button>
                    </Flex>
                  </Card>
                </Flex>
              )}
              {selectedTab == "3" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Flex direction="column" gap="1">
                      <TextField.Root
                        size="3"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => {
                          console.log(e.target.value);
                          setWithdrawAmount(e.target.value);
                        }}
                      >
                        <TextField.Slot>
                          <Image
                            src={
                              "/images/assets/" +
                              yieldDetails.asset.name.toLowerCase() +
                              ".svg"
                            }
                            width={20}
                            height={20}
                          />
                        </TextField.Slot>
                      </TextField.Root>
                      <Flex direction="row" justify="end" mx="2">
                        <Text
                          size="1"
                          weight="light"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setWithdrawAmount(
                              formatUnits(
                                withdrawable,
                                yieldDetails.asset.decimals
                              )
                            );
                          }}
                        >
                          {"Balance: " +
                            Number(
                              formatUnits(
                                withdrawable,
                                yieldDetails.asset.decimals
                              )
                            ).toFixed(6) +
                            " " +
                            yieldDetails.asset.name}
                        </Text>
                      </Flex>
                    </Flex>
                    <Separator size="4" />
                    {withdrawApproved ? (
                      <Button
                        disabled={
                          !wallets[0] ||
                          !withdrawApproved ||
                          withdrawAmount == 0 ||
                          parseUnits(
                            withdrawAmount,
                            yieldDetails.asset.decimals
                          ) > withdrawable ||
                          (yieldDetails.apy.maturityTimestamp &&
                            currentTimestamp <
                              yieldDetails.apy.maturityTimestamp)
                        }
                        onClick={async () => {
                          switchChain();
                          setTxConfirming(true);
                          var hash;

                          try {
                            hash = await adapterRegistry[
                              yieldDetails.protocol.toLowerCase()
                            ].withdraw(
                              wallets[0],
                              yieldDetails.chain.chainId,
                              yieldDetails.contractAddress,
                              parseUnits(
                                withdrawAmount,
                                yieldDetails.asset.decimals
                              )
                            );
                          } catch (error) {
                            console.error("withdraw error", error);
                            setTxConfirming(false);
                            return;
                          }
                          console.log("hash", hash);
                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chain.chainId,
                            }),
                          });

                          console.log("publicClient", publicClient);
                          console.log("waiting for tx receipt");

                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          setTxConfirming(false);

                          console.log("receipt", receipt);

                          console.log("deposit-tx done");

                          getDepositable();
                          getWithdrawable();
                        }}
                        variant="classic"
                      >
                        {txConfirming ? <Spinner /> : "Withdraw"}
                      </Button>
                    ) : (
                      <Button
                        disabled={withdrawAmount == 0 || !wallets[0]}
                        onClick={async () => {
                          switchChain();
                          setTxConfirming(true);
                          var hash;
                          try {
                            hash = await adapterRegistry[
                              yieldDetails.protocol.toLowerCase()
                            ].approveWithdraw(
                              wallets[0],
                              yieldDetails.chain.chainId,
                              yieldDetails.asset.address,
                              yieldDetails.contractAddress,
                              maxUint256
                            );
                          } catch (error) {
                            console.error("approveWithdraw error", error);
                            setTxConfirming(false);
                            return;
                          }

                          console.log("hash", hash);

                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chain.chainId,
                            }),
                          });

                          console.log("publicClient", publicClient);
                          console.log("waiting for tx receipt");

                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          await getWithdrawApproved();

                          setTxConfirming(false);
                        }}
                        variant="classic"
                      >
                        {txConfirming ? <Spinner /> : "Approve"}
                      </Button>
                    )}
                  </Flex>
                </Card>
              )}
              {selectedTab == "4" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Text size="2">Claimable Assets</Text>
                    <Separator size="4" />
                    <Button
                      onClick={() => {
                        switchChain();
                        claimAvailable &&
                          adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].claim();
                      }}
                      variant="classic"
                    >
                      Claim
                    </Button>
                  </Flex>
                </Card>
              )}

              <Card>
                <Flex direction="column" gap="1" mx="2">
                  <Flex direction="row" justify="between" align="center">
                    <Text size="2">In Wallet:</Text>
                    <Text size="3" weight="medium">
                      {Number(
                        formatUnits(depositable, yieldDetails.asset.decimals)
                      ).toFixed(6) +
                        " " +
                        yieldDetails.asset.name}
                    </Text>
                  </Flex>

                  <Flex direction="row" justify="between" align="center">
                    <Text size="2">Deposited:</Text>
                    <Text size="3" weight="medium">
                      {Number(
                        formatUnits(
                          yieldDetails.unlockDuration
                            ? unlockable
                            : withdrawable,
                          yieldDetails.asset.decimals
                        )
                      ).toFixed(6) +
                        " " +
                        yieldDetails.asset.name}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
              {yieldDetails.apy.type == "fixed" && (
                <Card>
                  <Flex direction="column" gap="1" mx="2">
                    <Text size="1">Maturity</Text>
                    <Flex direction="row" justify="between" align="center">
                      <Text size="3" weight="medium">
                        {"in " +
                          moment(
                            yieldDetails.apy.maturityTimestamp * 1000
                          ).diff(moment(), "days") +
                          " days"}
                      </Text>
                      <Text size="3" weight="medium">
                        {maturityDate.toDateString()}
                      </Text>
                    </Flex>
                  </Flex>
                </Card>
              )}
            </Flex>
            <Flex
              direction="column"
              gap="6"
              width={{
                initial: "100%",
                sm: "50%",
              }}
            >
              <Flex direction="row" justify="center" align="center">
                <Box
                  width={{
                    initial: "70%",
                    sm: "100%",
                  }}
                >
                  <Card>
                    <Flex direction="row" gap="5" justify="center" my="1">
                      <Flex direction="column" gap="1">
                        <Text size="1">Chain</Text>
                        <Text size="2" weight="medium">
                          {yieldDetails.chain.name}
                        </Text>
                      </Flex>
                      <Flex direction="column" gap="1">
                        <Text size="1">TVL</Text>
                        <Text size="2" weight="medium">
                          {Intl.NumberFormat("en-US", {
                            notation: "compact",
                            maximumFractionDigits: 2,
                          }).format(yieldDetails.tvl) + " $"}
                        </Text>
                      </Flex>
                      <Flex direction="column" gap="1">
                        <Text size="1">Risk Level</Text>
                        <Text size="2" weight="medium">
                          {(yieldDetails.risk ? yieldDetails.risk : 1) +
                            " / 10"}
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Box>
              </Flex>
              <Flex direction="column" gap="4">
                <Flex direction="row" justify="between" mx="2">
                  <Flex direction="row" gap="2">
                    <Flex direction="column" justify="end">
                      <Text size="6" weight="medium">
                        {Number(yieldDetails.apy.value * 100).toFixed(2) + "%"}
                      </Text>
                    </Flex>
                    <Flex direction="column">
                      <Text size="1" weight="light">
                        {yieldDetails.apy.type}
                      </Text>
                      <Text size="1" weight="light" trim="end">
                        APY
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex direction="row" gap="1" align="center">
                    {yieldDetails.type.map((type, i) => (
                      <Badge
                        key={i}
                        variant="soft"
                        size="1"
                        color="iris"
                        radius="large"
                      >
                        {type}
                      </Badge>
                    ))}
                  </Flex>
                </Flex>
                {yieldDetails.apy.history && (
                  <ApyChart historyData={yieldDetails.apy.history} />
                )}
              </Flex>
            </Flex>
          </Flex>
          <Flex mx="2" mt="6">
            <Callout.Root size="1">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text size="2">{yieldDetails.description}</Callout.Text>
            </Callout.Root>
          </Flex>
        </Flex>
      ) : (
        <div>Invalid ID</div>
      )}
    </>
  );
}
