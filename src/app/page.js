"use client";

import {
  Flex,
  Text,
  Button,
  IconButton,
  Grid,
  TextField,
  Table,
  Switch,
  Box,
  AlertDialog,
} from "@radix-ui/themes";
import { useState } from "react";
import Image from "next/image";
import {
  FaceIcon,
  ImageIcon,
  SunIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { useMediaQuery } from "react-responsive";
import ChainSelectionGrid from "./components/chainSelectionGrid";
import AssetTable from "./components/assetTable";

export default function Home() {
  const [selectedChains, setSelectedChains] = useState([]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useMediaQuery({ maxWidth: 640 }); // Adjust the max width as needed

  const handleClickChain = (chain) => {
    if (selectedChains.includes(chain)) {
      setSelectedChains(selectedChains.filter((c) => c !== chain));
    } else {
      setSelectedChains([...selectedChains, chain]);
    }
  };

  const handleClickAssetType = (assetType) => {
    if (selectedAssetTypes.includes(assetType)) {
      setSelectedAssetTypes(
        selectedAssetTypes.filter((type) => type !== assetType)
      );
    } else {
      setSelectedAssetTypes([...selectedAssetTypes, assetType]);
    }
  };
  return (
    <>
      <Flex direction="column" gap="6">
        <Flex direction="row" justify="between">
          <Flex
            direction="column"
            gap="2"
            width={{
              initial: "260px",
              xs: "300px",
            }}
          >
            <TextField.Root
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="surface"
              radius="large"
              placeholder="Search for an asset or protocol"
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
            <Grid columns="3" gap="1">
              <Button
                size="1"
                color="gray"
                variant={
                  selectedAssetTypes.includes("Stables") ? "solid" : "soft"
                }
                onClick={() => handleClickAssetType("Stables")}
              >
                Stables
              </Button>
              <Button
                size="1"
                color="gray"
                variant={
                  selectedAssetTypes.includes("Lending") ? "solid" : "soft"
                }
                onClick={() => handleClickAssetType("Lending")}
              >
                Lending
              </Button>
              <Button
                size="1"
                color="gray"
                variant={selectedAssetTypes.includes("LST") ? "solid" : "soft"}
                onClick={() => handleClickAssetType("LST")}
              >
                LST
              </Button>
              <Button
                size="1"
                color="gray"
                variant={selectedAssetTypes.includes("LRT") ? "solid" : "soft"}
                onClick={() => handleClickAssetType("LRT")}
              >
                LRT
              </Button>
              <Button
                size="1"
                color="gray"
                variant={
                  selectedAssetTypes.includes("Governance") ? "solid" : "soft"
                }
                onClick={() => handleClickAssetType("Governance")}
              >
                Governance
              </Button>
            </Grid>
          </Flex>
          {isMobile ? (
            <AlertDialog.Root>
              <AlertDialog.Trigger>
                <Button variant="classic">Chains</Button>
              </AlertDialog.Trigger>
              <AlertDialog.Content maxWidth="450px">
                <AlertDialog.Title>
                  {"Select Chains" +
                    (selectedChains.length > 0
                      ? " (" + selectedChains.length + ")"
                      : "")}
                </AlertDialog.Title>
                <Box m="8">
                  <ChainSelectionGrid
                    selectedChains={selectedChains}
                    handleClickChain={handleClickChain}
                  />
                </Box>

                <Flex gap="3" mt="4" justify="end">
                  <AlertDialog.Action>
                    <Button variant="classic">Done</Button>
                  </AlertDialog.Action>
                </Flex>
              </AlertDialog.Content>
            </AlertDialog.Root>
          ) : (
            <ChainSelectionGrid
              selectedChains={selectedChains}
              handleClickChain={handleClickChain}
            />
          )}
        </Flex>
        <AssetTable
          selectedChains={selectedChains}
          selectedAssetTypes={selectedAssetTypes}
          searchQuery={searchQuery}
        />
      </Flex>
    </>
  );
}
