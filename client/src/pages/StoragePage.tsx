import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { IPFSUploader } from '@/components/IPFSUploader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StoragePage() {
  const [activeTab, setActiveTab] = useState<string>('ipfs');
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-grow overflow-y-auto">
        <Topbar />
        
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Decentralized Storage</h1>
          
          <div className="mb-6">
            <p className="text-muted-foreground">
              Store files and content on decentralized networks. Use IPFS for permanent, content-addressable storage that integrates with your dApps.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="ipfs" className="text-sm">
                <i className="ri-cloud-line mr-2"></i>
                IPFS
              </TabsTrigger>
              <TabsTrigger value="arweave" className="text-sm">
                <i className="ri-archive-line mr-2"></i>
                Arweave
              </TabsTrigger>
              <TabsTrigger value="filecoin" className="text-sm">
                <i className="ri-folder-shield-line mr-2"></i>
                Filecoin
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ipfs" className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <IPFSUploader />
                </div>
                
                <div className="lg:col-span-1">
                  <Card className="bg-muted rounded-xl border-border overflow-hidden">
                    <CardHeader className="p-4 border-b border-border">
                      <CardTitle className="font-semibold">About IPFS</CardTitle>
                      <CardDescription>Decentralized file storage system</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-4">
                      <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                          <strong>InterPlanetary File System (IPFS)</strong> is a protocol and network designed to create a content-addressable, peer-to-peer method of storing and sharing files in a distributed system.
                        </p>
                        
                        <h3 className="text-foreground font-medium">Key Benefits:</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Content addressing instead of location addressing</li>
                          <li>Decentralized data storage and delivery</li>
                          <li>Reduced bandwidth costs</li>
                          <li>Censorship resistance</li>
                          <li>Data persistence through pinning</li>
                        </ul>
                        
                        <h3 className="text-foreground font-medium">Usage with Smart Contracts:</h3>
                        <p>
                          IPFS is commonly used to store NFT metadata, contract ABIs, and other large files that would be too expensive to store directly on the blockchain.
                        </p>
                        
                        <div className="bg-background p-3 rounded-md">
                          <code className="text-xs block font-mono">
                            // Store CID in a smart contract<br/>
                            contract IPFSStorage &#123;<br/>
                            &nbsp;&nbsp;mapping(uint =&gt; string) public tokenURIs;<br/>
                            <br/>
                            &nbsp;&nbsp;function setTokenURI(uint tokenId, string memory ipfsCID) public &#123;<br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;tokenURIs[tokenId] = ipfsCID;<br/>
                            &nbsp;&nbsp;&#125;<br/>
                            &#125;
                          </code>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="arweave" className="pt-4">
              <div className="flex items-center justify-center p-6 bg-muted rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <i className="ri-archive-line text-4xl mb-2 text-muted-foreground"></i>
                  <h3 className="text-lg font-medium mb-1">Arweave Integration</h3>
                  <p className="text-muted-foreground">Coming soon - permanent, decentralized data storage with Arweave</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="filecoin" className="pt-4">
              <div className="flex items-center justify-center p-6 bg-muted rounded-lg border border-dashed border-border">
                <div className="text-center">
                  <i className="ri-folder-shield-line text-4xl mb-2 text-muted-foreground"></i>
                  <h3 className="text-lg font-medium mb-1">Filecoin Integration</h3>
                  <p className="text-muted-foreground">Coming soon - decentralized storage marketplace with Filecoin</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}