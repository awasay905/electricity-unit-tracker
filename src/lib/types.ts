export interface User {
  uid: string;
  name: string;
  email: string;
  houseId: string | null;
}

export interface House {
  id: string;
  name: string;
  ownerId: string;
  joinCode: string;
  monthlyGoal: number;
  billingCycleStart: {
      date: string; // ISO string
      units: number;
  }
}

export interface Reading {
  id: string;
  value: number;
  date: string; // ISO string
  isBillingCycleStart: boolean;
}

export interface JoinRequest {
    requestId: string;
    houseId: string;
    requesterName: string;
    status: 'pending' | 'approved' | 'rejected';
}
