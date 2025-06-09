import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useWeb3 } from '@/hooks/use-web3'; // Changed import
import { Link } from 'wouter';

export default function ProjectsPage() {
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected } = useWeb3(); // Changed to useWeb3

  // Fetch projects (using mock user ID 1)
  const { data: projects = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/projects/1'],
  });

  // Project mutation
  const createProject = useMutation({
    mutationFn: async (projectData: { name: string, description: string, userId: number }) => {
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
      setNewProjectDescription('');
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

  const handleNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createProject.mutate({
        name: newProjectName.trim(),
        description: newProjectDescription.trim(),
        userId: 1 // Mock user ID
      });
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-grow overflow-y-auto">
        <Topbar onNewProject={() => setNewProjectDialogOpen(true)} />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Projects</h1>
            
            <Button 
              onClick={() => setNewProjectDialogOpen(true)}
              disabled={!isConnected}
            >
              <i className="ri-add-line mr-2"></i>
              New Project
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <Card className="bg-muted border-border">
              <CardContent className="py-10 text-center">
                <div className="w-16 h-16 bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-folder-add-line text-3xl text-primary"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Create your first project to get started</p>
                <Button 
                  onClick={() => setNewProjectDialogOpen(true)}
                  disabled={!isConnected}
                >
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any) => (
                <Card key={project.id} className="bg-muted border-border hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <Badge 
                        variant={project.status === 'active' ? 'default' : 'outline'} 
                        className={
                          project.status === 'active' 
                            ? 'bg-green-500/20 text-green-500 hover:bg-green-500/20' 
                            : 'bg-background text-muted-foreground'
                        }
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {project.description || 'No description provided.'}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="bg-background text-xs">
                        <i className="ri-file-code-line mr-1"></i> Solidity
                      </Badge>
                      <Badge variant="outline" className="bg-background text-xs">
                        <i className="ri-javascript-line mr-1"></i> JavaScript
                      </Badge>
                      <Badge variant="outline" className="bg-background text-xs">
                        <i className="ri-reactjs-line mr-1"></i> React
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Created {formatDate(project.createdAt)}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t border-border pt-4 flex justify-between">
                    <Link href={`/editor?project=${project.id}`}>
                      <Button variant="ghost" size="sm">
                        <i className="ri-code-s-slash-line mr-1"></i>
                        Open Editor
                      </Button>
                    </Link>
                    
                    {project.status === 'active' ? (
                      <Link href={`/deployments?project=${project.id}`}>
                        <Button variant="outline" size="sm" className="text-primary">
                          <i className="ri-rocket-line mr-1"></i>
                          View Deployments
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" size="sm" className="text-primary">
                        <i className="ri-play-line mr-1"></i>
                        Activate
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Sample Projects (for when there are projects) */}
          {projects.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">Project Templates</h2>
              <p className="text-muted-foreground mb-4">
                Get started quickly with these pre-built project templates.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted border-border hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                      <i className="ri-nft-line text-xl"></i>
                    </div>
                    <h3 className="font-medium text-lg mb-1">NFT Collection</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Create and deploy an ERC-721 NFT collection with metadata and minting functionality.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted border-border hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-3">
                      <i className="ri-coin-line text-xl"></i>
                    </div>
                    <h3 className="font-medium text-lg mb-1">ERC-20 Token</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Launch your own ERC-20 token with customizable supply, burning, and minting.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted border-border hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                      <i className="ri-government-line text-xl"></i>
                    </div>
                    <h3 className="font-medium text-lg mb-1">DAO Governance</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Set up a decentralized autonomous organization with voting and proposal mechanisms.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* New Project Dialog */}
      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter details for your new Web3 project.
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
              
              <div className="grid gap-2">
                <Label htmlFor="project-description">Description (Optional)</Label>
                <Textarea
                  id="project-description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Briefly describe your project"
                  rows={3}
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
              <Button 
                type="submit" 
                disabled={!newProjectName.trim() || createProject.isPending}
              >
                {createProject.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
