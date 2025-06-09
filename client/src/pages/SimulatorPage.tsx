import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { ContractTester } from '@/components/ContractTester';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWeb3 } from '@/hooks/use-web3'; // Changed import
import { Badge } from '@/components/ui/badge';

// Sample contract ABI
const sampleAbi = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_from",
        "type": "address"
      },
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

// Sample contract source
const sampleSource = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}`;

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState<string>('tester');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [contractSource, setContractSource] = useState<string>(sampleSource);
  const [contractAbi, setContractAbi] = useState<any[]>(sampleAbi);
  const [contractType, setContractType] = useState<string>('token');
  
  const { isConnected } = useWeb3(); // Changed to useWeb3
  
  const loadExampleContract = (type: string) => {
    setContractType(type);
    setContractSource(sampleSource);
    setContractAbi(sampleAbi);
    setContractAddress('');
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      
      <div className="flex-grow overflow-y-auto">
        <Topbar />
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Contract Testing & Simulation</h1>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => loadExampleContract('token')}
              >
                Load ERC20 Example
              </Button>
              <Button 
                variant="outline"
                onClick={() => loadExampleContract('nft')}
              >
                Load NFT Example
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-muted border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Gas Estimator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">~45,000</div>
                <p className="text-muted-foreground text-sm mt-1">Average gas per function call</p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Security Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-yellow-500">B+</div>
                  <Badge className="ml-2 bg-yellow-500">Medium Risk</Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">1 high, 2 medium issues found</p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Test Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">87%</div>
                <p className="text-muted-foreground text-sm mt-1">12/14 functions covered by tests</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-1">
              <Card className="bg-muted border-border h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Contract Details</CardTitle>
                  <CardDescription>Configure the contract for testing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contract-type">Contract Type</Label>
                      <Select value={contractType} onValueChange={setContractType}>
                        <SelectTrigger id="contract-type">
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="token">ERC20 Token</SelectItem>
                          <SelectItem value="nft">ERC721 NFT</SelectItem>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="dao">DAO</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="contract-address">Contract Address (Optional)</Label>
                      <Input 
                        id="contract-address" 
                        value={contractAddress} 
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder="0x..."
                        className="bg-background"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contract-source">Contract Source Code</Label>
                      <Textarea 
                        id="contract-source"
                        value={contractSource}
                        onChange={(e) => setContractSource(e.target.value)}
                        placeholder="// Paste your contract source code here"
                        className="h-40 font-mono text-xs bg-background"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        disabled={!isConnected}
                      >
                        <i className="ri-upload-2-line mr-2"></i>
                        Upload ABI
                      </Button>
                      <Button
                        size="sm"
                        disabled={!isConnected || !contractSource}
                      >
                        <i className="ri-hammer-line mr-2"></i>
                        Compile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tester">
                    <i className="ri-test-tube-line mr-2"></i>
                    Contract Tester
                  </TabsTrigger>
                  <TabsTrigger value="analyzer">
                    <i className="ri-scan-line mr-2"></i>
                    Code Analyzer
                  </TabsTrigger>
                  <TabsTrigger value="sandbox">
                    <i className="ri-box-3-line mr-2"></i>
                    Sandbox Environment
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="tester" className="pt-4">
                  <ContractTester 
                    contractAbi={contractAbi}
                    contractAddress={contractAddress}
                    contractSource={contractSource}
                  />
                </TabsContent>
                
                <TabsContent value="analyzer" className="pt-4">
                  <Card className="bg-muted border-border">
                    <CardHeader>
                      <CardTitle>Code Analyzer</CardTitle>
                      <CardDescription>
                        Deep analysis of contract code quality and best practices
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center items-center py-20 text-muted-foreground">
                        <div className="text-center">
                          <i className="ri-scan-line text-4xl mb-2"></i>
                          <h3 className="text-lg font-medium mb-1">Code Analyzer</h3>
                          <p>Coming soon in the next update</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sandbox" className="pt-4">
                  <Card className="bg-muted border-border">
                    <CardHeader>
                      <CardTitle>Sandbox Environment</CardTitle>
                      <CardDescription>
                        Test contracts in a controlled environment with virtual accounts
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center items-center py-20 text-muted-foreground">
                        <div className="text-center">
                          <i className="ri-box-3-line text-4xl mb-2"></i>
                          <h3 className="text-lg font-medium mb-1">Sandbox Environment</h3>
                          <p>Coming soon in the next update</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}