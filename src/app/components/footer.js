import {
  Flex,
  Switch,
  Text,
  Popover,
  Button,
  TextField,
  Separator,
  Box,
} from "@radix-ui/themes";
import moment from "moment";
import { formatUnits, createPublicClient, custom, extractChain } from "viem";
import { useWallets } from "@privy-io/react-auth";
import { base, mainnet, sepolia, arbitrum } from "viem/chains";
import { useState, useEffect } from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { CheckCircledIcon } from "@radix-ui/react-icons";

export default function Footer(props) {
  const [lastUpdate, setLastUpdate] = useState();
  const [mainnetGasPrice, setMainnetGasPrice] = useState();
  const [connectedChainName, setConnectedChainName] = useState();
  const { ready, wallets } = useWallets();

  useEffect(() => {
    // Get the last update time
    async function fetchLastUpdate() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/jvalentee/yieldhouse-data/main/data/lastUpdate.json"
        );
        if (response.ok) {
          const data = await response.json();
          setLastUpdate(data);
        } else {
          console.error(
            "Failed to fetch lastUpdate.json:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching lastUpdate.json:", error);
      }
    }

    fetchLastUpdate();
  }, []);

  useEffect(() => {
    console.log("fetchGasPrice:");
    async function fetchGasPrice() {
      const provider = await wallets[0].getEthereumProvider();
      console.log("Provider:", provider);
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: custom(provider),
      });

      const { gasPrice } = await publicClient.estimateFeesPerGas({
        type: "legacy",
      });

      console.log("Gas Price:", gasPrice);

      setMainnetGasPrice(gasPrice);
    }

    async function fetchConnectedChainName() {
      const provider = await wallets[0].getEthereumProvider();
      const publicClient = createPublicClient({
        chain: mainnet,
        transport: custom(provider),
      });
      const chainId = await publicClient.getChainId();
      const chain = extractChain({
        chains: [mainnet, base, arbitrum, sepolia],
        id: chainId,
      });

      setConnectedChainName(chain ? chain.name : "Unsupported Chain");
    }

    // GEt the gas price
    if (wallets && wallets.length > 0) {
      console.log("Fetching gas price...");
      fetchGasPrice();
      fetchConnectedChainName();
    }
  }, [ready, wallets]);

  return (
    <Flex direction="row" justify="between" align="center" mx="2" mb="2" mt="8">
      <Flex direction="row" justify="center" align="center" gapX="4">
        <Flex direction="row" justify="center" gapX="2">
          <CheckCircledIcon size="1" color="green" />
          <Text size="1">
            {"Updated " +
              (lastUpdate && moment(lastUpdate.timestamp * 1000).fromNow())}
          </Text>
        </Flex>
        {mainnetGasPrice && (
          <>
            <Separator orientation="vertical" />
            <Flex direction="row" align="center" justify="center" gapX="2">
              <Text size="1" weight="light">
                ⛽
              </Text>
              <Flex direction="column" gapY="0">
                <Text size="1">
                  {Number(formatUnits(mainnetGasPrice, 9)).toFixed(2) + " Gwei"}
                </Text>
                <Text size="1" weight="light">
                  {connectedChainName}
                </Text>
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
      <Popover.Root>
        <Popover.Trigger>
          <Button variant="ghost" color="gray">
            <GearIcon width="20" height="20" />
          </Button>
        </Popover.Trigger>
        <Popover.Content size="1">
          <Flex direction="column" gapY="2">
            <Flex direction="row" align="center" justify="between" gapX="2">
              <Text size="1" weight="light">
                Items per page
              </Text>
              <Box width="40px">
                <TextField.Root
                  size="1"
                  placeholder="8"
                  type="number"
                  defaultValue={props.settings.itemsPerPage}
                  onChange={(e) =>
                    props.setSettings({
                      testnet: props.settings.testnet,
                      itemsPerPage: parseInt(
                        e.target.value ? e.target.value : 8
                      ),
                    })
                  }
                />
              </Box>
            </Flex>

            <Flex direction="row" align="center" justify="between" gapX="2">
              <Text size="1" weight="light">
                Sepolia Testnet
              </Text>
              <Switch
                size="1"
                checked={props.settings.testnet}
                onCheckedChange={() =>
                  props.setSettings({
                    testnet: !props.settings.testnet,
                    itemsPerPage: props.settings.itemsPerPage,
                  })
                }
              />
            </Flex>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  );
}
