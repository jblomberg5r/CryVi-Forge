import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/hooks/use-web3'; // Changed import

interface ContractTesterProps {
  contractAbi?: any[];
  contractAddress?: string;
  contractSource?: string;
}

export function ContractTester({ 
  contractAbi = [],
  contractAddress = '',
  contractSource = '' 
}: ContractTesterProps) {
  const [activeTab, setActiveTab] = useState<string>('function-call');
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [functionInputs, setFunctionInputs] = useState<Record<string, string>>({});
  const [callResult, setCallResult] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [testCase, setTestCase] = useState<string>('');
  const [gasUsage, setGasUsage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [securityIssues, setSecurityIssues] = useState<any[]>([]);
  const [simulationEnvironment, setSimulationEnvironment] = useState<string>('mainnet');
  
  const { isConnected } = useWeb3(); // Changed to useWeb3
  const { toast } = useToast();

  // Extract function definitions from ABI
  const contractFunctions = contractAbi.filter((item: any) => 
    item.type === 'function' && !item.constant
  );
  
  const viewFunctions = contractAbi.filter((item: any) => 
    item.type === 'function' && item.constant
  );
  
  // Handle function selection
  const handleFunctionSelect = (functionName: string) => {
    setSelectedFunction(functionName);
    setFunctionInputs({});
    setCallResult('');
    
    // Reset inputs for the newly selected function
    const selectedFunctionDef = [...contractFunctions, ...viewFunctions].find(
      (f: any) => f.name === functionName
    );
    
    if (selectedFunctionDef && selectedFunctionDef.inputs) {
      const initialInputs: Record<string, string> = {};
      selectedFunctionDef.inputs.forEach((input: any) => {
        initialInputs[input.name || `param${input.type}`] = '';
      });
      setFunctionInputs(initialInputs);
    }
  };
  
  // Handle input change
  const handleInputChange = (name: string, value: string) => {
    setFunctionInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Execute function call
  const executeCall = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to call contract functions.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!selectedFunction) {
      toast({
        title: 'No Function Selected',
        description: 'Please select a function to call.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Mock function call for demo
      setTimeout(() => {
        setCallResult(JSON.stringify({
          success: true,
          returns: {
            value: Math.floor(Math.random() * 1000),
            gasUsed: Math.floor(Math.random() * 50000) + 21000
          }
        }, null, 2));
        
        setGasUsage(Math.floor(Math.random() * 50000) + 21000 + ' gas units');
        
        toast({
          title: 'Function Called',
          description: `Successfully called ${selectedFunction}()`,
        });
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to call function. Please check your inputs.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  // Run simulation
  const runSimulation = async () => {
    if (!contractSource) {
      toast({
        title: 'Missing Source Code',
        description: 'Please provide the contract source code for simulation.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Mock simulation for demo
      setTimeout(() => {
        setSimulationResult({
          success: true,
          gasEstimation: {
            deployment: Math.floor(Math.random() * 1000000) + 500000,
            avgFunctionCall: Math.floor(Math.random() * 50000) + 21000
          },
          memory: Math.floor(Math.random() * 100) + 'KB',
          executionTime: Math.floor(Math.random() * 100) + 'ms',
        });
        
        setSecurityIssues([
          {
            severity: 'High',
            title: 'Reentrancy Vulnerability',
            description: 'Contract might be vulnerable to reentrancy attacks in transfer function.',
            location: 'Line 42-57',
            recommendation: 'Implement checks-effects-interactions pattern'
          },
          {
            severity: 'Medium',
            title: 'Unbounded Loop',
            description: 'Function contains loop that could exceed gas limits with large arrays.',
            location: 'Line 98-105',
            recommendation: 'Add upper limit to loop iterations or implement batching'
          },
          {
            severity: 'Low',
            title: 'Timestamp Dependency',
            description: 'Contract relies on block timestamp for time-sensitive operations',
            location: 'Line 124',
            recommendation: 'Consider the limitations of timestamp precision'
          }
        ]);
        
        toast({
          title: 'Simulation Complete',
          description: 'Contract simulation finished successfully',
        });
        
        setIsLoading(false);
      }, 2500);
    } catch (error) {
      toast({
        title: 'Simulation Error',
        description: 'Failed to run simulation. Please check your contract code.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  // Run test cases
  const runTests = async () => {
    if (!testCase) {
      toast({
        title: 'No Test Case',
        description: 'Please provide a test case to run.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Mock test execution for demo
      setTimeout(() => {
        setCallResult(JSON.stringify({
          testsPassed: 2,
          testsFailed: 0,
          coverage: '87.4%',
          duration: '1.2s',
          details: [
            {
              name: 'should set correct initial balance',
              result: 'passed',
              duration: '432ms'
            },
            {
              name: 'should transfer tokens between accounts',
              result: 'passed',
              duration: '651ms'
            }
          ]
        }, null, 2));
        
        toast({
          title: 'Tests Completed',
          description: 'All tests passed successfully',
        });
        
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      toast({
        title: 'Test Error',
        description: 'Failed to run tests. Please check your test script.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card className="bg-muted rounded-lg border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Contract Testing & Simulation</CardTitle>
        <CardDescription>
          Test contract functions, run simulations, and analyze security issues
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="function-call">
              <i className="ri-function-line mr-2"></i>
              Function Call
            </TabsTrigger>
            <TabsTrigger value="simulation">
              <i className="ri-test-tube-line mr-2"></i>
              Simulation
            </TabsTrigger>
            <TabsTrigger value="security">
              <i className="ri-shield-check-line mr-2"></i>
              Security Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="function-call" className="border rounded-md p-4 border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <Label className="mb-2 block">Select Function</Label>
                  <Select onValueChange={handleFunctionSelect} value={selectedFunction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose function to call" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="placeholder" disabled>Choose function to call</SelectItem>
                      {viewFunctions.map((func: any) => (
                        <SelectItem key={func.name} value={func.name}>
                          {func.name} (View)
                        </SelectItem>
                      ))}
                      {contractFunctions.map((func: any) => (
                        <SelectItem key={func.name} value={func.name}>
                          {func.name} (Write)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedFunction && (
                  <div className="mb-4">
                    <Label className="mb-2 block">Function Parameters</Label>
                    <div className="space-y-3">
                      {Object.keys(functionInputs).map(paramName => (
                        <div key={paramName}>
                          <Label htmlFor={paramName} className="text-sm mb-1 block">
                            {paramName}
                          </Label>
                          <Input
                            id={paramName}
                            value={functionInputs[paramName]}
                            onChange={(e) => handleInputChange(paramName, e.target.value)}
                            placeholder={`Enter ${paramName}`}
                            className="bg-background"
                          />
                        </div>
                      ))}
                      
                      {Object.keys(functionInputs).length === 0 && (
                        <p className="text-sm text-muted-foreground">No parameters required</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-6">
                  <div>
                    {gasUsage && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Estimated Gas: </span>
                        <span className="font-medium">{gasUsage}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={executeCall}
                    disabled={!selectedFunction || isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <i className="ri-loader-2-line animate-spin mr-2"></i>
                        Executing...
                      </>
                    ) : (
                      <>
                        <i className="ri-play-circle-line mr-2"></i>
                        Execute Call
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Result</Label>
                <div className="bg-background rounded-md border border-border h-[300px] overflow-auto p-3">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : callResult ? (
                    <pre className="text-xs font-mono whitespace-pre-wrap">{callResult}</pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Execute a function call to see results
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="simulation" className="border rounded-md p-4 border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <Label className="mb-2 block">Contract Source Code</Label>
                  <Textarea 
                    value={contractSource}
                    placeholder="Paste your contract source code here"
                    className="h-[200px] mb-3 font-mono text-xs bg-background"
                    readOnly={!contractSource}
                  />
                  
                  <div className="mb-4">
                    <Label className="mb-2 block">Test Case</Label>
                    <Textarea 
                      value={testCase}
                      onChange={(e) => setTestCase(e.target.value)}
                      placeholder="Describe the test scenario or write a test script"
                      className="h-[100px] bg-background"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Label>Simulation Environment:</Label>
                    <Select 
                      value={simulationEnvironment} 
                      onValueChange={setSimulationEnvironment}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mainnet">Mainnet</SelectItem>
                        <SelectItem value="testnet">Testnet</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={runSimulation}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <i className="ri-test-tube-line mr-2"></i>
                      Run Simulation
                    </Button>
                    <Button 
                      onClick={runTests}
                      disabled={isLoading}
                      variant="outline"
                      className="flex-1"
                    >
                      <i className="ri-code-box-line mr-2"></i>
                      Run Test Cases
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Simulation Results</Label>
                <div className="bg-background rounded-md border border-border h-[350px] overflow-auto p-3">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : simulationResult ? (
                    <div className="space-y-4">
                      <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20">
                        <h3 className="text-sm font-medium mb-1 text-green-500">Simulation Successful</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Deployment Gas:</span>
                            <span className="ml-2 font-medium">{simulationResult.gasEstimation.deployment}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg. Function Call Gas:</span>
                            <span className="ml-2 font-medium">{simulationResult.gasEstimation.avgFunctionCall}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Memory Usage:</span>
                            <span className="ml-2 font-medium">{simulationResult.memory}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Execution Time:</span>
                            <span className="ml-2 font-medium">{simulationResult.executionTime}</span>
                          </div>
                        </div>
                      </div>
                      
                      {callResult && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Test Results</h3>
                          <pre className="text-xs font-mono whitespace-pre-wrap bg-muted-foreground/5 p-2 rounded-md">{callResult}</pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Run a simulation to see results
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="border rounded-md p-4 border-border">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Security Analysis</h3>
                
                <Button 
                  onClick={runSimulation}
                  disabled={isLoading}
                  size="sm"
                >
                  <i className="ri-scan-line mr-2"></i>
                  Scan Contract
                </Button>
              </div>
              
              {isLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Scanning contract for vulnerabilities...</p>
                  </div>
                </div>
              ) : securityIssues.length > 0 ? (
                <div className="space-y-4">
                  {securityIssues.map((issue, index) => (
                    <div key={index} className="border border-border rounded-md p-3 bg-background">
                      <div className="flex items-center mb-2">
                        <div className={`${getSeverityColor(issue.severity)} w-2 h-2 rounded-full mr-2`}></div>
                        <h4 className="font-medium">{issue.title}</h4>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                          issue.severity === 'High' ? 'bg-red-500/10 text-red-500' :
                          issue.severity === 'Medium' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <span className="ml-2 font-mono">{issue.location}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Recommendation:</span>
                          <span className="ml-2">{issue.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <i className="ri-shield-check-line text-3xl mb-2"></i>
                    <p>Run a security scan to check for vulnerabilities</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}