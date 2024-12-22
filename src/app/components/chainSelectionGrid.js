import {
  Flex,
  Text,
  Button,
  IconButton,
  Grid,
  TextField,
  Table,
  Box,
} from "@radix-ui/themes";
import { useMediaQuery } from "react-responsive";
import { useSettingsContext } from "./SettingsContext";

import Image from "next/image";

export default function ChainSelectionGrid(props) {
  const isMobile = useMediaQuery({ maxWidth: 640 }); // Adjust the max width as needed
  const settings = useSettingsContext();

  return (
    <>
      {!settings.testnet && (
        <Grid columns="3" gap="2">
          <Box align="center">
            <IconButton
              color={!props.selectedChains.includes("Ethereum") && "gray"}
              variant="surface"
              size={isMobile ? "4" : "3"}
              onClick={() => props.handleClickChain("Ethereum")}
            >
              <Image
                src="/images/chains/ethereum.png"
                width={isMobile ? 30 : 25}
                height={isMobile ? 30 : 25}
              />
            </IconButton>
          </Box>
          <Box align="center">
            <IconButton
              color={!props.selectedChains.includes("Arbitrum") && "gray"}
              variant="outline"
              size={isMobile ? "4" : "3"}
              onClick={() => props.handleClickChain("Arbitrum")}
            >
              <Image
                src="/images/chains/arbitrum.png"
                width={isMobile ? 30 : 25}
                height={isMobile ? 30 : 25}
              />
            </IconButton>
          </Box>
          <Box align="center">
            <IconButton
              color={!props.selectedChains.includes("Base") && "gray"}
              variant="outline"
              size={isMobile ? "4" : "3"}
              onClick={() => props.handleClickChain("Base")}
            >
              <Image
                src="/images/chains/base.png"
                width={isMobile ? 30 : 25}
                height={isMobile ? 30 : 25}
              />
            </IconButton>
          </Box>
        </Grid>
      )}
    </>
  );
}
