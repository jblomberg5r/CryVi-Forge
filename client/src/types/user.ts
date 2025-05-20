export interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  walletAddress?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Project {
  id: number;
  name: string;
  description?: string | null;
  userId: number;
  status: string;
  createdAt?: Date | null;
}

export interface Contract {
  id: number;
  userId: number;
  projectId?: number | null;
  name: string;
  address: string;
  network: string;
  abi: string;
  bytecode: string;
  createdAt?: Date | null;
}

export interface Token {
  id: number;
  userId: number;
  contractId?: number | null;
  name: string;
  symbol: string;
  type: string;
  network: string;
  address: string;
  createdAt?: Date | null;
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
  createdAt: string;
}