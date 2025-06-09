import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { Web3Provider } from "@/providers/Web3Provider"; // Commented out for Reown AppKit setup
import { ThemeProvider } from "@/components/ui/theme-provider";

// Reown AppKit imports
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi'; // New import

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}> {/* New Wrapper */}
        <ThemeProvider defaultTheme="dark" storageKey="cryvi-theme">
          {/* <Web3Provider> Commented out for Reown AppKit setup */}
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          {/* </Web3Provider> */}
        </ThemeProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

// Reown AppKit Configuration (outside component)
const projectId = 'YOUR_PROJECT_ID';

const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://example.com',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, arbitrum],
  projectId,
  ssr: true
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum],
  projectId,
  metadata,
  features: {
    analytics: true
  }
});

export default App;
