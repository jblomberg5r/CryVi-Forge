import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { StatsCard } from '@/components/StatsCard';
import { ProjectExplorer } from '@/components/ProjectExplorer';
import { ActivityFeed } from '@/components/ActivityFeed';
import { CodeEditor } from '@/components/CodeEditor';
import { ContractDeployment } from '@/components/ContractDeployment';
import { TokenCreator } from '@/components/TokenCreator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; // Added import
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FormEvent } from 'react';

export default function Dashboard() {
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get user from useAuth

  // Fetch projects (using mock user ID 1)
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects/1'],
  });

  // Fetch contracts
  const { data: contracts = [] } = useQuery<any[]>({
    queryKey: ['/api/contracts/user/1'],
  });

  // Project mutation
  const createProject = useMutation({
    mutationFn: async (projectData: { name: string, userId: number }) => {
      const res = await apiRequest('POST', '/api/projects', projectData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/1'] });
      toast({
        title: 'Project Created',
        description: 'Your new project has been created successfully.',
      });
      setNewProjectDialogOpen(false);
      setNewProjectName('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
      console.error('Create project error:', error);
    }
  });

  // Handle file selection
  const handleFileSelect = (fileId: number) => {
    setSelectedFileId(fileId);
  };

  // Handle new project
  const handleNewProject = (e: FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a project.',
        variant: 'destructive',
      });
      return;
    }
    if (newProjectName.trim()) {
      createProject.mutate({
        name: newProjectName.trim(),
        userId: user.id
      });
    }
  };

  // Get files for the first project
  const { data: files = [] } = useQuery<any[]>({
    queryKey: [`/api/files/project/${projects[0]?.id || 0}`],
    enabled: projects.length > 0,
  });

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-grow overflow-y-auto">
        <Topbar onNewProject={() => setNewProjectDialogOpen(true)} />
        
        <div className="p-6">
          {/* Hero Section */}
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-muted to-background border border-border overflow-hidden relative">
            <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
              <div className="mb-6 md:mb-0 md:mr-6">
                <h1 className="text-3xl font-bold mb-2">Build Web3 Applications</h1>
                <p className="text-muted-foreground mb-4 max-w-lg">Create, deploy, and manage decentralized applications with our comprehensive development platform.</p>
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-primary hover:bg-opacity-90 text-white flex items-center text-sm font-medium" onClick={() => setNewProjectDialogOpen(true)}>
                    <i className="ri-rocket-line mr-2"></i> New Project
                  </Button>
                  <Button variant="outline" className="bg-muted hover:bg-background text-foreground flex items-center text-sm font-medium">
                    <i className="ri-book-open-line mr-2"></i> Tutorials
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-1/3 flex-shrink-0">
                <svg 
                  viewBox="0 0 400 250" 
                  className="rounded-lg w-full h-auto"
                  style={{ filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))' }}
                >
                  <defs>
                    <linearGradient id="blockchainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#00D395" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="400" height="250" fill="#1E1E24" rx="10" />
                  
                  {/* Blockchain nodes visualization */}
                  <circle cx="100" cy="125" r="20" fill="url(#blockchainGradient)" />
                  <circle cx="200" cy="75" r="20" fill="url(#blockchainGradient)" />
                  <circle cx="300" cy="125" r="20" fill="url(#blockchainGradient)" />
                  <circle cx="200" cy="175" r="20" fill="url(#blockchainGradient)" />
                  
                  {/* Connections */}
                  <line x1="100" y1="125" x2="200" y2="75" stroke="#6C63FF" strokeWidth="2" />
                  <line x1="200" y1="75" x2="300" y2="125" stroke="#6C63FF" strokeWidth="2" />
                  <line x1="300" y1="125" x2="200" y2="175" stroke="#6C63FF" strokeWidth="2" />
                  <line x1="200" y1="175" x2="100" y2="125" stroke="#6C63FF" strokeWidth="2" />
                  <line x1="100" y1="125" x2="200" y2="175" stroke="#6C63FF" strokeWidth="2" />
                  <line x1="200" y1="75" x2="200" y2="175" stroke="#6C63FF" strokeWidth="2" />
                  
                  {/* Code blocks */}
                  <rect x="85" y="110" width="30" height="30" fill="none" stroke="#00D395" strokeWidth="1" />
                  <rect x="185" y="60" width="30" height="30" fill="none" stroke="#00D395" strokeWidth="1" />
                  <rect x="285" y="110" width="30" height="30" fill="none" stroke="#00D395" strokeWidth="1" />
                  <rect x="185" y="160" width="30" height="30" fill="none" stroke="#00D395" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Active Projects"
              value={projects.filter((p: any) => p.status === 'active').length}
              change={{ value: "+2 this week", isPositive: true }}
              badge={{ text: `${projects.length} Total`, color: "bg-primary bg-opacity-10 text-primary" }}
            />
            
            <StatsCard
              title="Deployed Contracts"
              value={contracts.length}
              change={{ value: "+3 this month", isPositive: true }}
              badge={{ text: `${contracts.length + 4} Total`, color: "bg-green-500 bg-opacity-10 text-green-500" }}
            />
            
            <StatsCard
              title="Gas Spent (ETH)"
              value="0.045"
              change={{ value: "+12% vs last", isPositive: false }}
              badge={{ text: "This Month", color: "bg-amber-500 bg-opacity-10 text-amber-500" }}
            />
          </div>
          
          {/* Main Workspace Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Explorer Column */}
            <div className="lg:col-span-1">
              <ProjectExplorer onFileSelect={handleFileSelect} />
              <ActivityFeed />
            </div>
            
            {/* Code Editor Column */}
            <div className="lg:col-span-2">
              <CodeEditor 
                projectId={projects[0]?.id || 0}
                initialFiles={files}
              />
              
              <ContractDeployment projectId={projects[0]?.id || 0} />
              
              <TokenCreator />
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 p-6 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-muted-foreground text-sm mb-4 md:mb-0">
                <span>&copy; 2023 DappForge. All rights reserved.</span>
              </div>
              
              <div className="flex items-center gap-6">
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Documentation</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm">API</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Blog</a>
                <a href="#" className="text-muted-foreground hover:text-foreground text-sm">Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Project Dialog */}
      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter a name for your new project. You can add files to it after creation.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleNewProject}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Dapp"
                  autoFocus
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewProjectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newProjectName.trim() || createProject.isPending}>
                {createProject.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
