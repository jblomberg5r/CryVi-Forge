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