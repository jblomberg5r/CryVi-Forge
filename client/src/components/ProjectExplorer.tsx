import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  // Fixed implementation that doesn't use hooks in render
  const renderProjects = () => {
    return projects.map((project) => {
      const isExpanded = expandedProjects.includes(project.id);
      
      // Separate query outside the render function for each project
      return (
        <ProjectItem 
          key={project.id}
          project={project}
          isExpanded={isExpanded}
          toggleExpand={toggleExpand}
          openNewFileDialog={openNewFileDialog}
          onFileSelect={onFileSelect}
          getFileIcon={getFileIcon}
        />
      );
    });
  };

  return (
    <>
      <Card className="bg-muted rounded-xl border-border overflow-hidden h-full">
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md font-medium">Projects</CardTitle>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => setNewProjectDialogOpen(true)}
            >
              <i className="ri-add-line"></i>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-2">
          <div className="space-y-1">
            {renderProjects()}
          </div>
        </CardContent>
      </Card>

      {/* New Project Dialog */}
      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Enter the details for your new blockchain project
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewProject}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My DApp"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setNewProjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New File Dialog */}
      <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
            <DialogDescription>
              Add a new file to your project
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewFile}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="MyContract"
                  className="col-span-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fileType">File Type</Label>
                <select
                  id="fileType"
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="solidity">Solidity (.sol)</option>
                  <option value="javascript">JavaScript (.js)</option>
                  <option value="typescript">TypeScript (.ts)</option>
                  <option value="markdown">Markdown (.md)</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setNewFileDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create File</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Separate component for project items to avoid hook issues
interface ProjectItemProps {
  project: Project;
  isExpanded: boolean;
  toggleExpand: (id: number) => void;
  openNewFileDialog: (id: number) => void;
  onFileSelect: (fileId: number) => void;
  getFileIcon: (fileType: string) => string;
}

function ProjectItem({ project, isExpanded, toggleExpand, openNewFileDialog, onFileSelect, getFileIcon }: ProjectItemProps) {
  // Query to get files for this project if expanded
  const { data: files = [] } = useQuery<File[]>({
    queryKey: [`/api/files/project/${project.id}`],
    enabled: isExpanded,
  });

  return (
    <div key={project.id} className="mb-2">
      <div 
        className={`flex items-center justify-between py-2 px-2 rounded cursor-pointer ${
          isExpanded ? 'bg-background text-primary' : ''
        }`}
        onClick={() => toggleExpand(project.id)}
      >
        <div className="flex items-center">
          <i className={`ri-folder-${isExpanded ? 'open-' : ''}line mr-2 text-primary`}></i>
          <span className="text-sm font-medium">{project.name}</span>
        </div>
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              openNewFileDialog(project.id);
            }}
          >
            <i className="ri-add-line text-sm"></i>
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="pl-6 space-y-1">
          {files.map((file) => (
            <div 
              key={file.id}
              className="flex items-center py-1.5 text-sm hover:bg-background px-2 rounded cursor-pointer"
              onClick={() => onFileSelect(file.id)}
            >
              <i className={`${getFileIcon(file.fileType)} mr-2`}></i>
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}