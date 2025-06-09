import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types/user';
import type { Project, Contract, Token, Activity } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWeb3 } from '@/hooks/use-web3'; // Changed import

export default function ProfilePage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const { isConnected, address } = useWeb3(); // Changed to useWeb3
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');

  // Query for user's projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: !!user,
  });

  // Query for user's tokens
  const { data: tokens = [] } = useQuery<Token[]>({
    queryKey: ['/api/tokens/user', user?.id],
    enabled: !!user?.id,
  });

  // Query for user's contracts
  const { data: contracts = [] } = useQuery<Contract[]>({
    queryKey: ['/api/contracts/user', user?.id],
    enabled: !!user?.id,
  });

  // Query for user's activities
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities', user?.id],
    enabled: !!user?.id,
  });

  // Mutation for connecting wallet
  const connectWalletMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      const res = await apiRequest('POST', '/api/users/wallet', { walletAddress });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: 'Wallet connected',
        description: 'Your wallet has been connected successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleConnectWallet = () => {
    if (address && isConnected) {
      connectWalletMutation.mutate(address);
    }
  };

  const handleSaveWallet = () => {
    if (walletAddress) {
      connectWalletMutation.mutate(walletAddress);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="text-center py-16">
          <CardContent>
            <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
            <p className="text-muted-foreground mb-8">You need to sign in to view your profile</p>
            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.profileImageUrl || ''} alt={user.firstName || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'CryVi User'}
              </CardTitle>
              <CardDescription className="text-sm break-all">
                {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Wallet Status</p>
                  {user.walletAddress ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm truncate">
                        Connected: {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(user.walletAddress.length - 4)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span className="text-sm">Not connected</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Account Stats</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted rounded-md p-2">
                      <p className="text-lg font-bold">{projects.length}</p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>
                    <div className="bg-muted rounded-md p-2">
                      <p className="text-lg font-bold">{contracts.length}</p>
                      <p className="text-xs text-muted-foreground">Contracts</p>
                    </div>
                    <div className="bg-muted rounded-md p-2">
                      <p className="text-lg font-bold">{tokens.length}</p>
                      <p className="text-xs text-muted-foreground">Tokens</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium">Connect Your Wallet</h3>
                  {isConnected ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm truncate">MetaMask Connected: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}</span>
                      </div>
                      <Button 
                        onClick={handleConnectWallet} 
                        size="sm" 
                        variant="secondary" 
                        className="w-full"
                        disabled={connectWalletMutation.isPending}
                      >
                        {connectWalletMutation.isPending ? 'Connecting...' : 'Sync to Profile'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter wallet address (0x...)"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                      />
                      <Button 
                        onClick={handleSaveWallet} 
                        size="sm" 
                        className="w-full"
                        disabled={!walletAddress || connectWalletMutation.isPending}
                      >
                        {connectWalletMutation.isPending ? 'Connecting...' : 'Save Wallet Address'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Activity</TabsTrigger>
              <TabsTrigger value="projects">My Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent actions and events on CryVi Forge
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity: any) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-md bg-muted/50">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <i className={`ri-${
                              activity.entityType === 'project' 
                                ? 'folder-line' 
                                : activity.entityType === 'contract' 
                                ? 'file-code-line' 
                                : activity.entityType === 'token' 
                                ? 'coin-line' 
                                : 'file-line'
                            } text-lg text-primary`}></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h4 className="font-medium text-sm">
                                {activity.action === 'create' 
                                  ? `Created ${activity.entityType}` 
                                  : activity.action === 'update' 
                                  ? `Updated ${activity.entityType}` 
                                  : activity.action === 'deploy' 
                                  ? `Deployed ${activity.entityType}` 
                                  : `${activity.action} ${activity.entityType}`}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.details.name}
                              {activity.details.network && ` on ${activity.details.network}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="projects" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Projects</CardTitle>
                  <CardDescription>
                    View and manage your CryVi Forge projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {projects.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven't created any projects yet</p>
                      <Button asChild>
                        <a href="/projects">Create Your First Project</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((project: any) => (
                        <Card key={project.id} className="overflow-hidden border-border">
                          <div className="bg-primary/5 p-4">
                            <div className="flex justify-between items-center">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <i className="ri-folder-line text-lg text-primary"></i>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                project.status === 'completed' 
                                  ? 'bg-green-500/10 text-green-500' 
                                  : project.status === 'in-progress' 
                                  ? 'bg-blue-500/10 text-blue-500' 
                                  : 'bg-gray-500/10 text-gray-500'
                              }`}>
                                {project.status}
                              </span>
                            </div>
                            <h3 className="font-medium mt-2">{project.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description || 'No description'}
                            </p>
                          </div>
                          <div className="p-3 flex justify-end bg-muted/30">
                            <Button asChild variant="ghost" size="sm">
                              <a href={`/editor?project=${project.id}`}>
                                <i className="ri-edit-line mr-1"></i> Edit
                              </a>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}