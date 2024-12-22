"use client";

import { Flex, Text, Heading, Separator, Code } from "@radix-ui/themes";
import { TwitterLogoIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function About() {
  return (
    <Flex direction="column" gap="6">
      <Flex direction="column" gapY="2">
        <Heading size="3">Integrated DeFi Protocols</Heading>
        <Text>AAVE, Pendle, Maker, Lido</Text>
      </Flex>
      <Flex direction="column" gapY="2">
        <Heading size="3">Best Practices</Heading>
        <Flex direction="column">
          <Text>
            ● Use{" "}
            <a
              href="https://rabby.io/"
              style={{ textDecoration: "underline" }}
              target="_blank"
            >
              Rabby Wallet
            </a>{" "}
            to interact with web3 applications. This ensures you receive a
            warning before signing any potentially malicious transactions.
          </Text>
          <Text>
            ● Use a{" "}
            <a
              target="_blank"
              href="https://www.coinbase.com/learn/crypto-basics/what-is-a-hardware-wallet"
              style={{ textDecoration: "underline" }}
            >
              hardware wallet
            </a>{" "}
            to store your funds. This gives an extra layer of security since
            your funds are stored offline.
          </Text>
          <Text>● Never share your seed phrase with anyone.</Text>
          <Text>
            ● When transacting in Ethereum mainnet, beware of the high gas fees.
            Sometimes it&apos;s better to wait for the network to be less
            congested before making the transaction.
          </Text>
        </Flex>
      </Flex>
      <Flex direction="column" gapY="2">
        <Heading size="3">About yield.house</Heading>
        <Text>
          yield.house is a platform that helps you find the best yield
          opportunities in crypto. We provide a curated list of the top yields
          across multiple, trusted decentralized finance protocols, allowing you
          to deposit and withdraw funds directly through the platform.
        </Text>
        <Text>
          yield.house has a 0% fee policy; we don&apos;t charge any fee for
          using the platform.
        </Text>
      </Flex>

      <Flex
        direction="row"
        align="center"
        justify="center"
        mt="4"
        gapX="4"
        width="full"
      >
        <Link target="_blank" href="https://x.com/yielddothouse">
          <TwitterLogoIcon width="32" height="32" />
        </Link>
        <Separator orientation="vertical" />
        <Link target="_blank" href="https://github.com/han1ue/yieldhouse">
          <GitHubLogoIcon width="30" height="30" />
        </Link>
      </Flex>
      <Flex direction="row" gapX="2" align="center" justify="center" mt="9">
        <Text>Made by @piggydeveloper with</Text>
        <Code weight="bold">.love()</Code>
      </Flex>
    </Flex>
  );
}
