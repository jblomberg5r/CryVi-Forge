import { useState, FormEvent } from 'react'; // Added FormEvent
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; // Added
import { Button } from '@/components/ui/button'; // Added
import { Input } from '@/components/ui/input'; // Added
import { Label } from '@/components/ui/label'; // Added
import { useToast } from '@/hooks/use-toast'; // Added
import { useAuth } from '@/hooks/useAuth'; // Added
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Added useMutation, useQueryClient
import { apiRequest } from '@/lib/queryClient'; // Added
import { ProjectExplorer } from '@/components/ProjectExplorer';
import { CodeEditor } from '@/components/CodeEditor';
import { ContractDeployment } from '@/components/ContractDeployment';
import { ContractBuilder } from '@/components/ContractBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// useQuery was already imported

export default function CodeEditorPage() {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('code-editor');
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false); // Added state
  const [newProjectName, setNewProjectName] = useState(''); // Added state

  const { toast } = useToast(); // Added
  const queryClient = useQueryClient(); // Added
  const { user } = useAuth(); // Added

  // Fetch projects (using mock user ID 1 - this might need to change if projects are user-specific and useAuth().user.id is available)
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects/1'], // TODO: Potentially update this query key if user ID is relevant for fetching projects
  });

  // Project mutation (copied from Dashboard.tsx)
  const createProject = useMutation({
    mutationFn: async (projectData: { name: string, userId: number }) => {
      const res = await apiRequest('POST', '/api/projects', projectData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/1'] }); // TODO: Update if queryKey changes
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

  // Handle new project (copied from Dashboard.tsx)
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

  // Handle file selection
  const handleFileSelect = (fileId: number) => {
    setSelectedFileId(fileId);
    // Switch to code editor tab when a file is selected
    setActiveTab('code-editor');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-grow overflow-y-auto">
        <Topbar onNewProject={() => setNewProjectDialogOpen(true)} /> {/* Added onNewProject prop */}
        
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Code Editor</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Project Explorer - 1/4 width on large screens */}
            <div className="lg:col-span-1">
              <ProjectExplorer onFileSelect={handleFileSelect} />
            </div>
            
            {/* Main content area - 3/4 width on large screens */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="code-editor" className="text-sm">
                    <i className="ri-code-s-slash-line mr-2"></i>
                    Code Editor
                  </TabsTrigger>
                  <TabsTrigger value="contract-builder" className="text-sm">
                    <i className="ri-drag-drop-line mr-2"></i>
                    Contract Builder
                  </TabsTrigger>
                  <TabsTrigger value="deployment" className="text-sm">
                    <i className="ri-rocket-line mr-2"></i>
                    Deployment
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="code-editor" className="pt-4">
                  <CodeEditor 
                    projectId={projects[0]?.id || 0}
                    initialFiles={files}
                  />
                </TabsContent>
                
                <TabsContent value="contract-builder" className="pt-4">
                  <ContractBuilder projectId={projects[0]?.id || 0} />
                </TabsContent>
                
                <TabsContent value="deployment" className="pt-4">
                  <ContractDeployment projectId={projects[0]?.id || 0} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Dialog (copied from Dashboard.tsx) */}
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
