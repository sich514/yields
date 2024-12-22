"use client";

import {
  Flex,
  Text,
  Button,
  Card,
  Heading,
  IconButton,
  Grid,
  TextField,
  Separator,
  Table,
  Box,
} from "@radix-ui/themes";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  const positions = [
    {
      id: "1",
      asset: "ETH",
      chain: "Ethereum",
      protocol: "AAVEV3",
      value: 1000,
      profit: 2000,
    },
  ];

  return (
    <Flex direction="column" gap="6">
      <Heading weight="medium">My current positions</Heading>
      <Grid columns="4" gap="2">
        {positions.map((position) => (
          <Card asChild key={position.id}>
            <Link href={"/details/" + position.id}>
              <Flex direction="column" align="center" gap="1">
                <Flex
                  direction="row"
                  justify="center"
                  align="center"
                  width="100%"
                  gap="3"
                >
                  <Flex
                    direction="row"
                    gap="3"
                    display={{
                      initial: "none",
                      sm: "flex",
                    }}
                  >
                    <Image
                      src={
                        "/images/assets/" +
                        position.asset.toLowerCase() +
                        ".svg"
                      }
                      width={25}
                      height={25}
                    />
                    <Separator orientation="vertical" size="1" />
                  </Flex>
                  <Image
                    src={
                      "/images/protocols/" +
                      position.protocol.toLowerCase() +
                      ".svg"
                    }
                    width={80}
                    height={60}
                  />
                </Flex>
                <Flex direction="row" justify="center" width="100%">
                  <Separator orientation="horizontal" size="4" />
                </Flex>

                <Flex direction="row" gap="4" mt="2" justify="between">
                  <Flex direction="column">
                    <Text size="1">Value</Text>
                    <Text size="2" weight="medium">
                      {position.value}
                    </Text>
                  </Flex>
                  <Flex direction="column">
                    <Text size="1">Profit</Text>
                    <Text size="2" weight="medium">
                      {position.profit}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Link>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
}
