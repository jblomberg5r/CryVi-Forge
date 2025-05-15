import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/ui/theme-provider';
import { Link } from 'wouter';
import { useWallet } from '@/hooks/use-wallet';

interface TopbarProps {
  onNewProject?: () => void;
}

export function Topbar({ onNewProject }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const { isConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
        <Link href="/profile">
          <a className="w-8 h-8 rounded-full bg-muted-foreground flex items-center justify-center text-background">
            <i className="ri-user-line"></i>
          </a>
        </Link>
      </div>
    </div>
  );
}
