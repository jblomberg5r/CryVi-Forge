import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ContractFunction {
  id: string;
  name: string;
  type: string;
  visibility: string;
  inputs: FunctionInput[];
  outputs: FunctionOutput[];
  stateMutability: string;
}

interface FunctionInput {
  id: string;
  name: string;
  type: string;
}

interface FunctionOutput {
  id: string;
  type: string;
}

interface ContractBuilderProps {
  projectId: number;
}

export function ContractBuilder({ projectId }: ContractBuilderProps) {
  const [contractName, setContractName] = useState<string>('');
  const [contractFunctions, setContractFunctions] = useState<ContractFunction[]>([]);
  const [availableFunctions, setAvailableFunctions] = useState<ContractFunction[]>([
    {
      id: 'transfer',
      name: 'transfer',
      type: 'function',
      visibility: 'public',
      inputs: [
        { id: 'to', name: 'to', type: 'address' },
        { id: 'amount', name: 'amount', type: 'uint256' }
      ],
      outputs: [{ id: 'success', type: 'bool' }],
      stateMutability: 'nonpayable'
    },
    {
      id: 'balanceOf',
      name: 'balanceOf',
      type: 'function',
      visibility: 'public',
      inputs: [{ id: 'account', name: 'account', type: 'address' }],
      outputs: [{ id: 'balance', type: 'uint256' }],
      stateMutability: 'view'
    },
    {
      id: 'approve',
      name: 'approve',
      type: 'function',
      visibility: 'public',
      inputs: [
        { id: 'spender', name: 'spender', type: 'address' },
        { id: 'amount', name: 'amount', type: 'uint256' }
      ],
      outputs: [{ id: 'success', type: 'bool' }],
      stateMutability: 'nonpayable'
    },
    {
      id: 'mint',
      name: 'mint',
      type: 'function',
      visibility: 'public',
      inputs: [
        { id: 'to', name: 'to', type: 'address' },
        { id: 'amount', name: 'amount', type: 'uint256' }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      id: 'burn',
      name: 'burn',
      type: 'function',
      visibility: 'public',
      inputs: [{ id: 'amount', name: 'amount', type: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      id: 'vote',
      name: 'vote',
      type: 'function',
      visibility: 'public',
      inputs: [
        { id: 'proposalId', name: 'proposalId', type: 'uint256' },
        { id: 'support', name: 'support', type: 'bool' }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      id: 'stake',
      name: 'stake',
      type: 'function',
      visibility: 'public',
      inputs: [{ id: 'amount', name: 'amount', type: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      id: 'unstake',
      name: 'unstake',
      type: 'function',
      visibility: 'public',
      inputs: [{ id: 'amount', name: 'amount', type: 'uint256' }],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    {
      id: 'createProposal',
      name: 'createProposal',
      type: 'function',
      visibility: 'public',
      inputs: [
        { id: 'target', name: 'target', type: 'address' },
        { id: 'value', name: 'value', type: 'uint256' },
        { id: 'data', name: 'data', type: 'bytes' },
        { id: 'description', name: 'description', type: 'string' }
      ],
      outputs: [{ id: 'proposalId', type: 'uint256' }],
      stateMutability: 'nonpayable'
    }
  ]);
  
  const [draggedFunction, setDraggedFunction] = useState<ContractFunction | null>(null);
  const [editingFunction, setEditingFunction] = useState<ContractFunction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const contractAreaRef = useRef<HTMLDivElement>(null);
  
  // Generate Solidity code
  const generateSolidityCode = () => {
    // Add SPDX license identifier and pragma statement
    let code = '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\n';
    
    // Import common OpenZeppelin contracts if needed
    code += 'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";\n';
    code += 'import "@openzeppelin/contracts/access/Ownable.sol";\n\n';
    
    // Contract declaration
    code += `contract ${contractName || 'MyContract'} is ERC20, Ownable {\n`;
    
    // Constructor
    code += '    constructor() ERC20("MyToken", "MTK") {\n';
    code += '        // Initialize contract\n';
    code += '    }\n\n';
    
    // Add functions
    contractFunctions.forEach(func => {
      // Function signature
      code += `    ${func.visibility} ${func.stateMutability === 'view' ? 'view ' : ''}function ${func.name}(`;
      
      // Function inputs
      const inputParams = func.inputs.map(input => `${input.type} ${input.name}`).join(', ');
      code += inputParams;
      
      // Function outputs
      code += ') ';
      if (func.outputs.length > 0) {
        const outputTypes = func.outputs.map(output => output.type).join(', ');
        code += `returns (${outputTypes}) `;
      }
      
      // Function body
      code += '{\n';
      code += '        // Implement function logic\n';
      
      // Return statement for non-void functions
      if (func.outputs.length > 0) {
        if (func.outputs[0].type === 'bool') {
          code += '        return true;\n';
        } else if (func.outputs[0].type === 'uint256') {
          code += '        return 0;\n';
        } else if (func.outputs[0].type === 'address') {
          code += '        return address(0);\n';
        } else {
          code += '        // Return appropriate value\n';
        }
      }
      
      code += '    }\n\n';
    });
    
    // Close contract
    code += '}\n';
    
    return code;
  };
  
  // Save contract to project
  const saveContract = useMutation({
    mutationFn: async (contractData: any) => {
      const res = await apiRequest('POST', '/api/files', contractData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Contract Saved',
        description: 'Your contract has been saved to the project.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/files/project/${projectId}`] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save contract. Please try again.',
        variant: 'destructive',
      });
      console.error('Save contract error:', error);
    }
  });
  
  const handleSaveContract = () => {
    if (!contractName) {
      toast({
        title: 'Missing Contract Name',
        description: 'Please provide a name for your contract.',
        variant: 'destructive',
      });
      return;
    }
    
    const solidity = generateSolidityCode();
    
    saveContract.mutate({
      name: `${contractName}.sol`,
      projectId,
      content: solidity,
      fileType: 'solidity'
    });
  };
  
  const handleDragStart = (func: ContractFunction) => {
    setDraggedFunction(func);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (contractAreaRef.current) {
      contractAreaRef.current.classList.add('border-primary');
    }
  };
  
  const handleDragLeave = () => {
    if (contractAreaRef.current) {
      contractAreaRef.current.classList.remove('border-primary');
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (contractAreaRef.current) {
      contractAreaRef.current.classList.remove('border-primary');
    }
    
    if (draggedFunction) {
      // Create a copy of the function with a unique ID
      const newFunction = {
        ...draggedFunction,
        id: `${draggedFunction.id}_${Date.now()}`
      };
      
      setContractFunctions(prev => [...prev, newFunction]);
      setDraggedFunction(null);
    }
  };
  
  const handleDeleteFunction = (id: string) => {
    setContractFunctions(prev => prev.filter(func => func.id !== id));
  };
  
  const handleEditFunction = (func: ContractFunction) => {
    setEditingFunction(func);
    setIsEditModalOpen(true);
  };
  
  const handleSaveEdit = (updatedFunc: ContractFunction) => {
    setContractFunctions(prev => 
      prev.map(func => func.id === updatedFunc.id ? updatedFunc : func)
    );
    setIsEditModalOpen(false);
    setEditingFunction(null);
  };
  
  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingFunction(null);
  };
  
  const renderFunction = (func: ContractFunction, isDraggable: boolean = false) => {
    const visibility = func.visibility === 'public' ? 'Public' : 
                      func.visibility === 'private' ? 'Private' : 
                      func.visibility === 'internal' ? 'Internal' : 'External';
    
    const stateMutability = func.stateMutability === 'view' ? 'View' :
                          func.stateMutability === 'pure' ? 'Pure' :
                          func.stateMutability === 'payable' ? 'Payable' : 'NonPayable';
    
    return (
      <div 
        key={func.id}
        draggable={isDraggable}
        onDragStart={isDraggable ? () => handleDragStart(func) : undefined}
        className={`p-3 mb-2 rounded-lg ${
          func.stateMutability === 'view' ? 'bg-blue-500/10 border border-blue-500/20' : 
          func.stateMutability === 'pure' ? 'bg-green-500/10 border border-green-500/20' : 
          func.stateMutability === 'payable' ? 'bg-amber-500/10 border border-amber-500/20' : 
          'bg-purple-500/10 border border-purple-500/20'
        } cursor-${isDraggable ? 'grab' : 'default'} hover:shadow-sm transition-shadow`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">{func.name}</div>
          <div className="flex items-center space-x-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{visibility}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{stateMutability}</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <div className="mb-1">
            <span className="font-medium">Inputs:</span> {func.inputs.length > 0 ? 
              func.inputs.map(input => `${input.name}: ${input.type}`).join(', ') : 
              'None'}
          </div>
          <div>
            <span className="font-medium">Outputs:</span> {func.outputs.length > 0 ? 
              func.outputs.map(output => output.type).join(', ') : 
              'None'}
          </div>
        </div>
        
        {!isDraggable && (
          <div className="flex justify-end mt-2 space-x-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => handleEditFunction(func)}
            >
              <i className="ri-edit-line mr-1"></i>
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteFunction(func.id)}
            >
              <i className="ri-delete-bin-line mr-1"></i>
              Remove
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  // Function edit modal
  const renderEditModal = () => {
    if (!editingFunction) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Edit Function</h3>
          
          <div className="space-y-4">
            <div>
              <Label>Function Name</Label>
              <Input 
                value={editingFunction.name} 
                onChange={(e) => setEditingFunction({
                  ...editingFunction,
                  name: e.target.value
                })}
              />
            </div>
            
            <div>
              <Label>Visibility</Label>
              <select 
                className="w-full bg-background rounded-md text-sm py-2 px-3 text-foreground border border-border"
                value={editingFunction.visibility}
                onChange={(e) => setEditingFunction({
                  ...editingFunction,
                  visibility: e.target.value
                })}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>
            
            <div>
              <Label>State Mutability</Label>
              <select 
                className="w-full bg-background rounded-md text-sm py-2 px-3 text-foreground border border-border"
                value={editingFunction.stateMutability}
                onChange={(e) => setEditingFunction({
                  ...editingFunction,
                  stateMutability: e.target.value
                })}
              >
                <option value="nonpayable">Non-payable</option>
                <option value="view">View</option>
                <option value="pure">Pure</option>
                <option value="payable">Payable</option>
              </select>
            </div>
            
            <div>
              <Label className="flex justify-between items-center">
                <span>Inputs</span>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditingFunction({
                    ...editingFunction,
                    inputs: [
                      ...editingFunction.inputs,
                      { id: `input_${Date.now()}`, name: 'newParam', type: 'uint256' }
                    ]
                  })}
                >
                  <i className="ri-add-line mr-1"></i> Add
                </Button>
              </Label>
              
              <div className="space-y-2 mt-2">
                {editingFunction.inputs.map((input, index) => (
                  <div key={input.id} className="flex items-center space-x-2">
                    <Input 
                      placeholder="Name"
                      value={input.name}
                      onChange={(e) => {
                        const newInputs = [...editingFunction.inputs];
                        newInputs[index] = { ...input, name: e.target.value };
                        setEditingFunction({
                          ...editingFunction,
                          inputs: newInputs
                        });
                      }}
                      className="flex-1"
                    />
                    <select 
                      className="bg-background rounded-md text-sm py-2 px-3 text-foreground border border-border"
                      value={input.type}
                      onChange={(e) => {
                        const newInputs = [...editingFunction.inputs];
                        newInputs[index] = { ...input, type: e.target.value };
                        setEditingFunction({
                          ...editingFunction,
                          inputs: newInputs
                        });
                      }}
                    >
                      <option value="uint256">uint256</option>
                      <option value="address">address</option>
                      <option value="bool">bool</option>
                      <option value="string">string</option>
                      <option value="bytes">bytes</option>
                    </select>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 text-red-500"
                      onClick={() => {
                        setEditingFunction({
                          ...editingFunction,
                          inputs: editingFunction.inputs.filter(i => i.id !== input.id)
                        });
                      }}
                    >
                      <i className="ri-close-line"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="flex justify-between items-center">
                <span>Outputs</span>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={() => setEditingFunction({
                    ...editingFunction,
                    outputs: [
                      ...editingFunction.outputs,
                      { id: `output_${Date.now()}`, type: 'uint256' }
                    ]
                  })}
                >
                  <i className="ri-add-line mr-1"></i> Add
                </Button>
              </Label>
              
              <div className="space-y-2 mt-2">
                {editingFunction.outputs.map((output, index) => (
                  <div key={output.id} className="flex items-center space-x-2">
                    <select 
                      className="bg-background rounded-md text-sm py-2 px-3 text-foreground border border-border flex-1"
                      value={output.type}
                      onChange={(e) => {
                        const newOutputs = [...editingFunction.outputs];
                        newOutputs[index] = { ...output, type: e.target.value };
                        setEditingFunction({
                          ...editingFunction,
                          outputs: newOutputs
                        });
                      }}
                    >
                      <option value="uint256">uint256</option>
                      <option value="address">address</option>
                      <option value="bool">bool</option>
                      <option value="string">string</option>
                      <option value="bytes">bytes</option>
                    </select>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 p-0 text-red-500"
                      onClick={() => {
                        setEditingFunction({
                          ...editingFunction,
                          outputs: editingFunction.outputs.filter(o => o.id !== output.id)
                        });
                      }}
                    >
                      <i className="ri-close-line"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={() => handleSaveEdit(editingFunction)}>
              Save Function
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <Card className="bg-muted rounded-xl border-border overflow-hidden mb-6">
        <CardHeader className="p-4 border-b border-border flex items-center justify-between">
          <CardTitle className="font-semibold">Contract Builder</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-background"
              onClick={handleSaveContract}
              disabled={saveContract.isPending}
            >
              <i className="ri-save-line mr-2"></i>
              {saveContract.isPending ? 'Saving...' : 'Save Contract'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Function palette */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Available Functions</h3>
                <p className="text-xs text-muted-foreground mb-4">Drag functions to the contract area</p>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {availableFunctions.map(func => renderFunction(func, true))}
                </div>
              </div>
            </div>
            
            {/* Contract area */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Label htmlFor="contract-name">Contract Name</Label>
                <Input
                  id="contract-name"
                  placeholder="MyContract"
                  className="bg-background"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                />
              </div>
              
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Contract Functions</h3>
              
              <div 
                ref={contractAreaRef}
                className="border-2 border-dashed border-border rounded-lg min-h-[300px] p-4 transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {contractFunctions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <i className="ri-drag-drop-line text-4xl mb-2"></i>
                    <div className="text-center">
                      <p>Drag functions here to build your contract</p>
                      <p className="text-xs mt-1">You can edit functions after adding them</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {contractFunctions.map(func => renderFunction(func))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isEditModalOpen && renderEditModal()}
    </>
  );
}