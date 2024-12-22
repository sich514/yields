"use client";

import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { useState, useEffect } from "react";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { Container } from "@radix-ui/themes";
import { PrivyProvider } from "@privy-io/react-auth";
import Header from "./components/header";
import { SettingsContextProvider } from "./components/SettingsContext";
import { base, mainnet, sepolia, arbitrum } from "viem/chains";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Footer from "./components/footer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [settings, setSettings] = useState({
    testnet: false,
    itemsPerPage: 8,
  });
  const [appearance, setAppearance] = useState();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAppearance = localStorage.getItem("appearance");
      if (storedAppearance) {
        console.log("storedAppearance", storedAppearance);
        setAppearance(storedAppearance);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setAppearance("dark");
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && appearance) {
      localStorage.setItem("appearance", appearance);
    }
    console.log("appearance", appearance);
  }, [appearance]);

  const muiTheme = createTheme({
    palette: {
      mode: appearance,
    },
  });

  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyProvider
          appId="clvyg5hc308tixi9m43pjngmw"
          config={{
            defaultChain: mainnet,
            chains: [mainnet, base, arbitrum, sepolia],
          }}
        >
          <Theme
            accentColor="mint"
            grayColor="gray"
            panelBackground="solid"
            scaling="100%"
            radius="medium"
            appearance={appearance}
          >
            <ThemeProvider theme={muiTheme}>
              <Container maxWidth="640px" mx="2">
                <Header appearance={appearance} setAppearance={setAppearance} />
                <SettingsContextProvider settings={settings}>
                  {children}
                  <Analytics />
                </SettingsContextProvider>
                <Footer setSettings={setSettings} settings={settings} />
              </Container>
            </ThemeProvider>
          </Theme>
        </PrivyProvider>
      </body>
    </html>
  );
}
