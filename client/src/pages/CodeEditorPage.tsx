import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { ProjectExplorer } from '@/components/ProjectExplorer';
import { CodeEditor } from '@/components/CodeEditor';
import { ContractDeployment } from '@/components/ContractDeployment';
import { ContractBuilder } from '@/components/ContractBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';

export default function CodeEditorPage() {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('code-editor');
  
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
    // Switch to code editor tab when a file is selected
    setActiveTab('code-editor');
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
    </div>
  );
}
