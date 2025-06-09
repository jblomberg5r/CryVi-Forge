import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useWeb3 } from '@/hooks/use-web3'; // Changed import

// Simple line number component
const LineNumber = ({ number }: { number: number }) => (
  <span className="text-right pr-4 inline-block w-10 opacity-50 select-none">
    {number}
  </span>
);

// Code editor component
interface EditorProps {
  projectId: number;
  initialFiles: {
    id: number;
    name: string;
    content: string;
    fileType: string;
  }[];
}

export function CodeEditor({ projectId, initialFiles }: EditorProps) {
  const [activeFileId, setActiveFileId] = useState<number | null>(null);
  const [files, setFiles] = useState(initialFiles);
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected, address } = useWeb3(); // Changed to useWeb3

  useEffect(() => {
    if (initialFiles.length > 0 && !activeFileId) {
      setActiveFileId(initialFiles[0].id);
      setContent(initialFiles[0].content);
    }
  }, [initialFiles, activeFileId]);

  const handleTabChange = (fileId: string) => {
    const id = parseInt(fileId);
    setActiveFileId(id);
    const file = files.find(f => f.id === id);
    if (file) {
      setContent(file.content);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const saveFile = async () => {
    if (!activeFileId || !isConnected) return;

    try {
      const response = await apiRequest('PUT', `/api/files/${activeFileId}`, {
        content,
        userId: 1 // Mock user ID until auth is implemented
      });

      if (response.ok) {
        // Update local state
        setFiles(files.map(file => 
          file.id === activeFileId ? { ...file, content } : file
        ));

        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: [`/api/files/project/${projectId}`] });
        
        toast({
          title: "File saved",
          description: "Your changes have been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving file:", error);
      toast({
        title: "Save failed",
        description: "Could not save your changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to close a tab
  const closeTab = (e: React.MouseEvent, fileId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If we're closing the active tab, switch to the first tab
    if (activeFileId === fileId && files.length > 1) {
      const nextFile = files.find(f => f.id !== fileId);
      if (nextFile) {
        setActiveFileId(nextFile.id);
        setContent(nextFile.content);
      }
    }
    
    // Remove the file from local state (in a real application, you'd confirm this action)
    setFiles(files.filter(f => f.id !== fileId));
  };

  // Function to highlight Solidity syntax
  const highlightSolidity = (code: string) => {
    // This is a simple implementation - a real one would use a proper syntax highlighter
    return code.split('\n').map((line, i) => (
      <div key={i} className="code-line flex">
        <LineNumber number={i + 1} />
        <span 
          dangerouslySetInnerHTML={{ 
            __html: line
              .replace(/(pragma|solidity|contract|import|using|for|function|public|private|view|returns|uint|address|string|bool|event|indexed|memory|storage|calldata|payable|struct|mapping|emit|modifier|require|return|if|else|while|for|constructor|is|new|delete|assembly|unchecked|\b0x[a-fA-F0-9]+\b)/g, '<span class="text-fuchsia-400">$1</span>')
              .replace(/(\/\/.*)/g, '<span class="text-slate-500">$1</span>')
              .replace(/(".*?")/g, '<span class="text-yellow-300">$1</span>')
              .replace(/(\b\d+\b)/g, '<span class="text-purple-400">$1</span>')
              .replace(/(@[a-zA-Z0-9\/_-]+)/g, '<span class="text-cyan-300">$1</span>')
          }} 
        />
      </div>
    ));
  };

  // Get active file
  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className="bg-muted rounded-xl border border-border overflow-hidden mb-6 h-full">
      <Tabs
        defaultValue={activeFileId?.toString()}
        value={activeFileId?.toString()}
        onValueChange={handleTabChange}
        className="w-full h-full flex flex-col"
      >
        <div className="flex border-b border-border overflow-x-auto">
          <TabsList className="bg-transparent h-auto flex-grow justify-start">
            {files.map(file => (
              <TabsTrigger
                key={file.id}
                value={file.id.toString()}
                className={cn(
                  "px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none flex items-center",
                  activeFileId === file.id ? "font-medium" : "text-muted-foreground"
                )}
              >
                <span>{file.name}</span>
                <button
                  className="ml-2 text-muted-foreground hover:text-foreground"
                  onClick={(e) => closeTab(e, file.id)}
                >
                  <i className="ri-close-line"></i>
                </button>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {files.map(file => (
          <TabsContent
            key={file.id}
            value={file.id.toString()}
            className="flex-grow flex flex-col p-0 m-0 h-full"
          >
            <div className="code-editor font-mono text-sm overflow-auto flex-grow bg-background p-4">
              {file.fileType === 'solidity' ? (
                <pre className="whitespace-pre">{highlightSolidity(content)}</pre>
              ) : (
                <textarea
                  className="w-full h-full bg-transparent outline-none resize-none font-mono"
                  value={content}
                  onChange={handleContentChange}
                />
              )}
            </div>

            <div className="flex justify-between p-3 border-t border-border text-sm">
              <div className="flex items-center">
                <span className="text-muted-foreground mr-4">
                  {file.fileType === 'solidity' ? 'Solidity 0.8.17' : file.fileType}
                </span>
                <span className="text-muted-foreground">
                  Line {content.split('\n').length}, Col {content.split('\n').pop()?.length || 0}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-muted-foreground hover:text-foreground"
                >
                  <i className="ri-terminal-line mr-1"></i>
                  <span>Console</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-muted-foreground hover:text-foreground"
                  onClick={saveFile}
                  disabled={!isConnected}
                >
                  <i className="ri-save-line mr-1"></i>
                  <span>Save</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
