import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/ui/theme-provider';
import { Link } from 'wouter';
import { useWallet } from '@/providers/WalletProvider';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/user';
import { NetworkSwitcher } from '@/components/ui/network-switcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopbarProps {
  onNewProject?: () => void;
}

export function Topbar({ onNewProject }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const { isConnected, address, disconnectWallet } = useWallet();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="bg-muted border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <Button 
          variant="secondary" 
          className="flex items-center space-x-2"
          onClick={onNewProject}
          disabled={!isConnected}
        >
          <i className="ri-add-line"></i>
          <span className="ml-2 text-sm font-medium">New Project</span>
        </Button>
        
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <i className="ri-search-line"></i>
          </span>
          <Input
            type="text"
            placeholder="Search..."
            className="bg-background text-sm py-2 pl-10 pr-4 w-64 border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {isConnected && (
          <NetworkSwitcher showTestnets={true} />
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <i className={`ri-${theme === 'dark' ? 'sun-line' : 'moon-line'}`}></i>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <i className="ri-notification-3-line"></i>
        </Button>
        
        {isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <i className="ri-user-line"></i>
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <i className="ri-user-line mr-2"></i>
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/projects">
                  <i className="ri-folder-line mr-2"></i>
                  My Projects
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="text-xs text-muted-foreground truncate w-full">
                  {address ? 
                    `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 
                    'Wallet Connected'}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => disconnectWallet()}>
                <i className="ri-logout-box-line mr-2"></i>
                Disconnect Wallet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="default" size="sm" className="gap-2">
            <Link href="/login">
              <i className="ri-wallet-3-line mr-1"></i>
              Connect Wallet
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
