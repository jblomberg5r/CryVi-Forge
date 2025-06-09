import { Switch, Route } from "wouter";
// import { queryClient } from "./lib/queryClient"; // Commented out
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // QueryClient added, QueryClientProvider to be used by AppKitProvider
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import React, { type PropsWithChildren } from 'react'; // Added React and PropsWithChildren

// Reown AppKit imports
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi'; // To be used by AppKitProvider

import Dashboard from "@/pages/Dashboard";
import CodeEditorPage from "@/pages/CodeEditorPage";
import TokenPage from "@/pages/TokenPage";
import ProjectsPage from "@/pages/ProjectsPage";
import TemplatesPage from "@/pages/TemplatesPage";
import StoragePage from "@/pages/StoragePage";
import SimulatorPage from "@/pages/SimulatorPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/not-found";

// --- Existing Reown AppKit Configuration (kept as is) ---
const projectId = '8594def3c8b0d70f631d84072d43d9e0'; // This should be replaced with an actual ID

const metadata = {
  name: 'CryVi Forge',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png']
};

// Initialize QueryClient locally
const queryClient = new QueryClient();

const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, arbitrum], // Networks for WagmiAdapter
  projectId,
  ssr: true // Assuming SSR might be true, adjust if not
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum], // Networks for AppKit global config
  projectId,
  metadata,
  features: {
    analytics: true // Example feature flag
  }
});
// --- End of Existing Reown AppKit Configuration ---


// --- New AppKitProvider Component ---
interface AppKitProviderProps extends PropsWithChildren {}

function AppKitProvider({ children }: AppKitProviderProps) {
  return (
    // WagmiProvider uses wagmiAdapter.wagmiConfig from the top-level scope
    // queryClient is imported from ./lib/queryClient
    <WagmiProvider config={wagmiAdapter.wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
// --- End of New AppKitProvider Component ---


function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/editor" component={CodeEditorPage} />
      <Route path="/tokens" component={TokenPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/templates" component={TemplatesPage} />
      <Route path="/storage" component={StoragePage} />
      <Route path="/simulator" component={SimulatorPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/login" component={LoginPage} />
      {/* Added placeholder routes */}
      <Route path="/docs" component={NotFound} />
      <Route path="/console" component={NotFound} />
      <Route path="/settings" component={NotFound} />
      <Route path="/security" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppKitProvider> {/* Use the new AppKitProvider */}
      <ThemeProvider defaultTheme="dark" storageKey="cryvi-theme">
        {/* Web3Provider was already commented out */}
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </AppKitProvider>
  );
}

export default App;
