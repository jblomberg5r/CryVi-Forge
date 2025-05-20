import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { initIPFSClient, addFileToIPFS, addContentToIPFS, IPFS_GATEWAY_URL } from '@/lib/ipfs';

export function IPFSUploader() {
  const [activeTab, setActiveTab] = useState<string>('file');
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [pinContent, setPinContent] = useState<boolean>(true);
  const [ipfsService, setIpfsService] = useState<string>('infura');
  const [apiCredentials, setApiCredentials] = useState({
    projectId: '',
    projectSecret: ''
  });
  const [recentUploads, setRecentUploads] = useState<Array<{hash: string, name: string, timestamp: number}>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Load recent uploads from localStorage
  useEffect(() => {
    const savedUploads = localStorage.getItem('ipfs-uploads');
    if (savedUploads) {
      try {
        setRecentUploads(JSON.parse(savedUploads));
      } catch (error) {
        console.error('Error loading recent uploads', error);
      }
    }
  }, []);
  
  // Save recent uploads to localStorage
  const saveUpload = (hash: string, name: string) => {
    const newUpload = { hash, name, timestamp: Date.now() };
    const updatedUploads = [newUpload, ...recentUploads.slice(0, 9)];
    setRecentUploads(updatedUploads);
    localStorage.setItem('ipfs-uploads', JSON.stringify(updatedUploads));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  const handleUpload = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(10);
      
      const ipfsClient = initIPFSClient(
        apiCredentials.projectId || undefined,
        apiCredentials.projectSecret || undefined
      );
      
      let result;
      if (activeTab === 'file' && file) {
        setUploadProgress(30);
        result = await addFileToIPFS(file, ipfsClient);
        setUploadProgress(90);
        
        if (result.success) {
          setIpfsHash(result.hash);
          saveUpload(result.hash, file.name);
          toast({
            title: 'Upload Successful',
            description: 'File has been uploaded to IPFS.',
          });
        }
      } else if (activeTab === 'json' && content) {
        setUploadProgress(30);
        
        let contentObj;
        try {
          // Try to parse if it's valid JSON
          contentObj = JSON.parse(content);
        } catch (e) {
          // If not valid JSON, use as string
          contentObj = content;
        }
        
        result = await addContentToIPFS(contentObj, ipfsClient);
        setUploadProgress(90);
        
        if (result.success) {
          setIpfsHash(result.hash);
          saveUpload(result.hash, 'json-content-' + new Date().toISOString().slice(0, 10));
          toast({
            title: 'Upload Successful',
            description: 'Content has been uploaded to IPFS.',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'Please select a file or enter content to upload.',
          variant: 'destructive',
        });
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }
      
      if (!result.success) {
        toast({
          title: 'Upload Failed',
          description: 'There was an error uploading to IPFS.',
          variant: 'destructive',
        });
      }
      
      setUploadProgress(100);
    } catch (error) {
      console.error('Error in IPFS upload:', error);
      toast({
        title: 'Upload Error',
        description: 'An unexpected error occurred during upload.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard!',
    });
  };
  
  return (
    <Card className="bg-muted rounded-xl border-border overflow-hidden">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="font-semibold">IPFS Decentralized Storage</CardTitle>
          <CardDescription>
            Upload files to IPFS for permanent, decentralized storage
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="text-sm">
              <i className="ri-file-upload-line mr-2"></i>
              File Upload
            </TabsTrigger>
            <TabsTrigger value="json" className="text-sm">
              <i className="ri-code-line mr-2"></i>
              JSON Content
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="pt-4">
            <div className="mb-4">
              <Label className="mb-2 block">Select File</Label>
              <div className="border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <i className="ri-upload-cloud-2-line text-4xl mb-3 text-muted-foreground"></i>
                <p className="text-sm text-muted-foreground mb-1">Click to select a file or drag and drop</p>
                <p className="text-xs text-muted-foreground">Max file size: 50MB</p>
              </div>
            </div>
            
            {file && (
              <div className="mb-4 p-3 bg-background rounded-md">
                <div className="flex items-center">
                  <i className="ri-file-line text-xl mr-2 text-primary"></i>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">{formatBytes(file.size)}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    <i className="ri-close-line"></i>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="json" className="pt-4">
            <div className="mb-4">
              <Label className="mb-2 block">JSON Content</Label>
              <textarea
                className="w-full min-h-32 p-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm"
                placeholder="Enter JSON content or plain text..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mb-4">
          <Label className="mb-2 block">IPFS Service</Label>
          <RadioGroup value={ipfsService} onValueChange={setIpfsService} className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="infura" id="infura" />
              <Label htmlFor="infura" className="cursor-pointer">Infura IPFS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pinata" id="pinata" />
              <Label htmlFor="pinata" className="cursor-pointer">Pinata</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="web3storage" id="web3storage" />
              <Label htmlFor="web3storage" className="cursor-pointer">Web3.Storage</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox 
              id="api-credentials" 
              checked={apiCredentials.projectId !== '' || apiCredentials.projectSecret !== ''}
              onCheckedChange={() => {
                if (apiCredentials.projectId === '' && apiCredentials.projectSecret === '') {
                  setApiCredentials({ projectId: '', projectSecret: '' });
                } else {
                  setApiCredentials({ projectId: '', projectSecret: '' });
                }
              }}
            />
            <Label htmlFor="api-credentials" className="cursor-pointer">Use API credentials</Label>
          </div>
          
          {(apiCredentials.projectId !== '' || apiCredentials.projectSecret !== '') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-id" className="mb-1 block text-sm">Project ID</Label>
                <Input
                  id="project-id"
                  type="password"
                  placeholder="Enter Project ID..."
                  value={apiCredentials.projectId}
                  onChange={(e) => setApiCredentials({ ...apiCredentials, projectId: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div>
                <Label htmlFor="project-secret" className="mb-1 block text-sm">Project Secret</Label>
                <Input
                  id="project-secret"
                  type="password"
                  placeholder="Enter Project Secret..."
                  value={apiCredentials.projectSecret}
                  onChange={(e) => setApiCredentials({ ...apiCredentials, projectSecret: e.target.value })}
                  className="bg-background"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id="pin-content" 
            checked={pinContent}
            onCheckedChange={(checked) => setPinContent(checked as boolean)}
          />
          <Label htmlFor="pin-content" className="cursor-pointer">Pin content to ensure permanent storage</Label>
        </div>
        
        {isUploading && (
          <div className="mb-4">
            <Label className="mb-1 block text-sm">Upload Progress</Label>
            <Progress value={uploadProgress} className="h-2 mb-1" />
            <div className="text-xs text-muted-foreground text-right">{uploadProgress}%</div>
          </div>
        )}
        
        {ipfsHash && (
          <div className="mb-4 p-3 bg-background rounded-md">
            <Label className="mb-1 block text-sm">Content IPFS Hash (CID)</Label>
            <div className="flex items-center">
              <code className="text-sm text-muted-foreground flex-1 font-mono truncate">{ipfsHash}</code>
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 h-7 w-7 p-0 text-primary"
                onClick={() => copyToClipboard(ipfsHash)}
              >
                <i className="ri-file-copy-line"></i>
              </Button>
            </div>
            <div className="mt-2">
              <Label className="mb-1 block text-sm">Gateway URL</Label>
              <div className="flex items-center">
                <code className="text-sm text-muted-foreground flex-1 font-mono truncate">{IPFS_GATEWAY_URL + ipfsHash}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2 h-7 w-7 p-0 text-primary"
                  onClick={() => copyToClipboard(IPFS_GATEWAY_URL + ipfsHash)}
                >
                  <i className="ri-file-copy-line"></i>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2 h-7 w-7 p-0 text-blue-500"
                  onClick={() => window.open(IPFS_GATEWAY_URL + ipfsHash, '_blank')}
                >
                  <i className="ri-external-link-line"></i>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center">
          <Button
            onClick={handleUpload}
            disabled={isUploading || (activeTab === 'file' && !file) || (activeTab === 'json' && !content)}
            className="w-full md:w-auto"
          >
            {isUploading ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="ri-upload-cloud-2-line mr-2"></i>
                Upload to IPFS
              </>
            )}
          </Button>
        </div>
        
        {recentUploads.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Recent Uploads</h3>
            <div className="border rounded-md border-border overflow-hidden">
              <div className="bg-muted-foreground/5 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7">CID</div>
                  <div className="col-span-3">Name</div>
                  <div className="col-span-2">Actions</div>
                </div>
              </div>
              <div className="divide-y divide-border">
                {recentUploads.map((upload) => (
                  <div key={upload.hash} className="px-3 py-2 text-xs">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-7 font-mono truncate">{upload.hash}</div>
                      <div className="col-span-3 truncate">{upload.name}</div>
                      <div className="col-span-2 flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(IPFS_GATEWAY_URL + upload.hash)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <i className="ri-file-copy-line"></i>
                        </button>
                        <button
                          onClick={() => window.open(IPFS_GATEWAY_URL + upload.hash, '_blank')}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <i className="ri-external-link-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}