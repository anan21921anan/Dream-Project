
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  balance: number;
  referralCode: string;
  isSuspended: boolean;
  personalNotice?: string;
  hasUnreadNotice?: boolean;
  createdAt: string;
}

export interface PhotoRecord {
  id: string;
  userId: string;
  userName: string;
  originalImage: string;
  resultImage: string;
  options: PhotoOptions;
  createdAt: string;
}

export interface PhotoOptions {
  gender: 'male' | 'female';
  size: string;
  customWidth?: string;
  customHeight?: string;
  background: string;
  dress: string;
  faceSmooth: boolean; 
  lightFix: boolean;   
  brightness: number; 
  fairness: number;   
}

export interface RechargeRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: string;
  senderNumber: string;
  trxId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

export interface SystemSettings {
  notice: string;
  helpline: string;
  paymentMethods: { name: string; number: string; logo?: string }[];
  generationCost: number;
  welcomeBonus: number;
  adminPin: string;
}
