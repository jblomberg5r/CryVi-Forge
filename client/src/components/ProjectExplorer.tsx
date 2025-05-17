import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEvent } from 'react';

interface Project {
  id: number;
  name: string;
  status: string;
}

interface File {
  id: number;
  name: string;
  fileType: string;
  projectId: number;
}

interface ProjectExplorerProps {
  onFileSelect: (fileId: number) => void;
}

export function ProjectExplorer({ onFileSelect }: ProjectExplorerProps) {
  const [expandedProjects, setExpandedProjects] = useState<number[]>([1]); // Default expand first project
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('solidity');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects (using mock user ID 1)
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects/1'],
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

  // File mutation
  const createFile = useMutation({
    mutationFn: async (fileData: { name: string, projectId: number, fileType: string, content: string }) => {
      const res = await apiRequest('POST', '/api/files', fileData);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/files/project/${data.projectId}`] });
      toast({
        title: 'File Created',
        description: 'Your new file has been created successfully.',
      });
      setNewFileDialogOpen(false);
      setNewFileName('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create file. Please try again.',
        variant: 'destructive',
      });
      console.error('Create file error:', error);
    }
  });

  // Function to get files by project
  const getFilesByProject = (projectId: number) => {
    return useQuery<File[]>({
      queryKey: [`/api/files/project/${projectId}`],
      enabled: expandedProjects.includes(projectId),
    });
  };

  // Toggle project expansion
  const toggleExpand = (projectId: number) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId) 
        : [...prev, projectId]
    );
  };

  // Handle new project creation
  const handleNewProject = (e: FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      createProject.mutate({
        name: newProjectName.trim(),
        userId: 1 // Mock user ID
      });
    }
  };

  // Handle new file creation
  const handleNewFile = (e: FormEvent) => {
    e.preventDefault();
    if (newFileName.trim() && selectedProject) {
      let extension = '';
      switch (newFileType) {
        case 'solidity': extension = '.sol'; break;
        case 'javascript': extension = '.js'; break;
        case 'typescript': extension = '.ts'; break;
        case 'markdown': extension = '.md'; break;
        default: extension = '';
      }

      // Add extension if not already present
      const fileName = newFileName.endsWith(extension) ? newFileName : `${newFileName}${extension}`;

      createFile.mutate({
        name: fileName,
        projectId: selectedProject,
        fileType: newFileType,
        content: ''
      });
    }
  };

  // Open new file dialog
  const openNewFileDialog = (projectId: number) => {
    setSelectedProject(projectId);
    setNewFileDialogOpen(true);
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'solidity': return 'ri-file-code-line text-primary';
      case 'javascript': case 'typescript': return 'ri-javascript-line text-yellow-500';
      case 'markdown': return 'ri-file-text-line text-blue-500';
      default: return 'ri-file-line text-muted-foreground';
    }
  };

  return (
    <>
      <Card className="bg-muted rounded-xl border-border overflow-hidden h-full">
        <CardHeader className="p-4 border-b border-border flex items-center justify-between">
          <CardTitle className="font-semibold">Project Explorer</CardTitle>
          <div className="flex">
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <i className="ri-refresh-line text-muted-foreground"></i>
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setNewProjectDialogOpen(true)}>
              <i className="ri-add-line text-muted-foreground"></i>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No projects found</p>
              <Button variant="outline" className="mt-4" onClick={() => setNewProjectDialogOpen(true)}>
                Create New Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const { data: files = [] } = getFilesByProject(project.id);
                const isExpanded = expandedProjects[project.id];
                
                return (
                  <div key={project.id} className="mb-4">
                    <div 
                      className="flex items-center justify-between mb-2 cursor-pointer"
                      onClick={() => toggleExpand(project.id)}
                    >
                      <div className="flex items-center">
                        <i className={`ri-arrow-${isExpanded ? 'down' : 'right'}-s-line mr-2 text-muted-foreground`}></i>
                        <span className="font-medium">{project.name}</span>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        project.status === 'active' 
                          ? "bg-primary bg-opacity-20 text-primary" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {project.status}
                      </span>
                    </div>
                    
                    {isExpanded && (
                      <div className="pl-6 space-y-1">
                        {files.map((file) => (
                          <div 
                            key={file.id}
                            className="flex items-center py-1.5 text-sm hover:bg-background px-2 rounded cursor-pointer"
                            onClick={() => handleFileClick(file.id)}
                          >
                            <i className={`${getFileIcon(file.fileType)} mr-2`}></i>
                            <span>{file.name}</span>
                          </div>
                        ))}
                        
                        <div 
                          className="flex items-center py-1.5 text-sm hover:bg-background px-2 rounded cursor-pointer text-muted-foreground"
                          onClick={() => openNewFileDialog(project.id)}
                        >
                          <i className="ri-add-line mr-2"></i>
                          <span>Add new file</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        
        <div className="p-4 border-t border-border">
          <Button 
            className="w-full flex items-center justify-center gap-2 bg-muted-foreground/10 hover:bg-muted-foreground/20 text-foreground"
            onClick={() => setNewProjectDialogOpen(true)}
          >
            <i className="ri-add-line"></i>
            New Project
          </Button>
        </div>
      </Card>

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
              <Button type="submit" disabled={!newProjectName.trim()}>
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New File Dialog */}
      <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>
              Enter a name and select a type for your new file.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleNewFile}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file-name">File Name</Label>
                <Input
                  id="file-name"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="MyContract.sol"
                  autoFocus
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="file-type">File Type</Label>
                <select
                  id="file-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value)}
                >
                  <option value="solidity">Solidity (.sol)</option>
                  <option value="javascript">JavaScript (.js)</option>
                  <option value="typescript">TypeScript (.ts)</option>
                  <option value="markdown">Markdown (.md)</option>
                </select>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewFileDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!newFileName.trim()}>
                Create File
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}