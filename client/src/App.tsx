import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Web3Provider } from "@/hooks/use-web3.tsx";
import Dashboard from "@/pages/Dashboard";
import CodeEditorPage from "@/pages/CodeEditorPage";
import TokenPage from "@/pages/TokenPage";
import ProjectsPage from "@/pages/ProjectsPage";
import TemplatesPage from "@/pages/TemplatesPage";
import StoragePage from "@/pages/StoragePage";
import SimulatorPage from "@/pages/SimulatorPage";
import ProfilePage from "@/pages/ProfilePage";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;
