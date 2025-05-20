import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Logo } from '@/icons/Logo';

interface NavItem {
  name: string;
  icon: string;
  path: string;
}

const workspaceItems: NavItem[] = [
  { name: 'Dashboard', icon: 'dashboard-line', path: '/' },
  { name: 'My Projects', icon: 'file-code-line', path: '/projects' },
  { name: 'Tokens', icon: 'coin-line', path: '/tokens' },
];

const developmentItems: NavItem[] = [
  { name: 'Code Editor', icon: 'code-s-slash-line', path: '/editor' },
  { name: 'Templates', icon: 'layout-grid-line', path: '/templates' },
  { name: 'Storage', icon: 'cloud-line', path: '/storage' },
  { name: 'Simulator', icon: 'test-tube-line', path: '/simulator' },
  { name: 'Documentation', icon: 'book-2-line', path: '/docs' },
  { name: 'Console', icon: 'terminal-box-line', path: '/console' },
];

const settingsItems: NavItem[] = [
  { name: 'General', icon: 'settings-3-line', path: '/settings' },
  { name: 'Security', icon: 'shield-line', path: '/security' },
];

const networks = [
  { name: 'Ethereum Sepolia', value: 'sepolia' },
  { name: 'Polygon Mumbai', value: 'mumbai' },
  { name: 'BSC Testnet', value: 'bsc-testnet' },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [network, setNetwork] = useState('sepolia');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderNavItems = (items: NavItem[], label: string) => (
    <div className="mb-6">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{label}</h2>
      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = location === item.path;
          return (
            <li key={item.name}>
              <Link href={item.path} 
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive 
                    ? 'bg-primary bg-opacity-20 text-primary' 
                    : 'text-foreground hover:bg-muted'
                }`}>
                <i className={`ri-${item.icon} mr-3`}></i>
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      <div className={`w-full md:w-64 bg-muted flex-shrink-0 border-r border-border flex flex-col ${
        isMobileMenuOpen ? 'fixed inset-0 z-50' : 'hidden md:flex'
      }`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <h1 className="text-xl font-bold">DappForge</h1>
          </div>
          <button
            className="md:hidden text-foreground"
            onClick={toggleMobileMenu}
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        
        <nav className="flex-grow overflow-y-auto p-4">
          {renderNavItems(workspaceItems, 'Workspace')}
          {renderNavItems(developmentItems, 'Development')}
          {renderNavItems(settingsItems, 'Settings')}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-muted-foreground">Current Network</span>
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger className="bg-background text-sm h-7 w-40 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((net) => (
                    <SelectItem key={net.value} value={net.value}>
                      {net.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {}}
          >
            Connect Wallet
          </Button>
        </div>
      </div>
      
      {/* Mobile menu button (only shown on mobile) */}
      <button
        id="mobile-menu-toggle"
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-background text-foreground border border-border"
        onClick={toggleMobileMenu}
      >
        <i className={`ri-${isMobileMenuOpen ? 'close-line' : 'menu-line'} text-xl`}></i>
      </button>
    </>
  );
}
