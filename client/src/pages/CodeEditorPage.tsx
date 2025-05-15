import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { ProjectExplorer } from '@/components/ProjectExplorer';
import { CodeEditor } from '@/components/CodeEditor';
import { ContractDeployment } from '@/components/ContractDeployment';
import { useQuery } from '@tanstack/react-query';

export default function CodeEditorPage() {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  
  // Fetch projects (using mock user ID 1)
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ['/api/projects/1'],
  });

  // Get files for the first project
  const { data: files = [] } = useQuery<any[]>({
    queryKey: [`/api/files/project/${projects[0]?.id || 0}`],
    enabled: projects.length > 0,
  });

  // Handle file selection
  const handleFileSelect = (fileId: number) => {
    setSelectedFileId(fileId);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-grow overflow-y-auto">
        <Topbar />
        
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Code Editor</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Project Explorer - 1/4 width on large screens */}
            <div className="lg:col-span-1">
              <ProjectExplorer onFileSelect={handleFileSelect} />
            </div>
            
            {/* Code Editor - 3/4 width on large screens */}
            <div className="lg:col-span-3">
              <CodeEditor 
                projectId={projects[0]?.id || 0}
                initialFiles={files}
              />
              
              <ContractDeployment projectId={projects[0]?.id || 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
