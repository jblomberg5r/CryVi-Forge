export interface Project {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  status: string;
  createdAt: string | Date;
}

export interface Contract {
  id: number;
  name: string;
  address: string | null;
  network: string | null;
  abi: any;
  userId: number;
  projectId: number | null;
  deployedAt: string | Date | null;
}

export interface Token {
  id: number;
  name: string;
  symbol: string;
  type: string;
  supply: string | null;
  address: string | null;
  network: string | null;
  userId: number;
  contractId: number | null;
  features: any;
  createdAt: string | Date;
}

export interface Activity {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number;
  details: {
    name: string;
    network?: string;
    action?: string;
  };
  createdAt: string | Date;
}