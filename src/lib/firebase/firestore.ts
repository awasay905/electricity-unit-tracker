import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import type { User, House, Reading, JoinRequest } from '@/lib/types';

// --- User Functions ---

export const createUser = async (uid: string, name: string, email: string): Promise<void> => {
  await setDoc(doc(db, 'users', uid), { uid, name, email, houseId: null });
};

export const getUser = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as User) : null;
};

export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
}

export const addUserToHouse = async (uid: string, houseId: string): Promise<void> => {
    await updateUser(uid, { houseId });
}

export const removeUserFromHouse = async (uid: string): Promise<void> => {
    await updateUser(uid, { houseId: null });
}


// --- House Functions ---

function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createHouse = async (
    ownerId: string, 
    name: string, 
    monthlyGoal: number, 
    billingCycleStart: { date: string; units: number }
): Promise<House | null> => {
  const houseData = {
    name,
    ownerId,
    monthlyGoal,
    billingCycleStart,
    joinCode: generateJoinCode(),
  };

  const docRef = await addDoc(collection(db, 'houses'), houseData);
  await addUserToHouse(ownerId, docRef.id);
  
  // Add the initial billing reading
  await addDoc(collection(db, 'houses', docRef.id, 'readings'), {
      value: billingCycleStart.units,
      date: billingCycleStart.date,
      isBillingCycleStart: true
  });
  
  const newHouseData = await getDoc(doc(db, 'houses', docRef.id));
  return newHouseData.exists() ? { id: newHouseData.id, ...newHouseData.data() } as House : null;
};

export const getHouse = async (houseId: string): Promise<House | null> => {
  const docRef = doc(db, 'houses', houseId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as House) : null;
};

export const getHouseByJoinCode = async (joinCode: string): Promise<House | null> => {
    const q = query(collection(db, "houses"), where("joinCode", "==", joinCode));
    const querySnapshot = await getDocs(q);
    if(querySnapshot.empty){
        return null;
    }
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as House;
}

export const getHouseMembers = async (houseId: string): Promise<User[]> => {
    const q = query(collection(db, "users"), where("houseId", "==", houseId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
}

export const updateHouse = async (houseId: string, data: Partial<House>): Promise<void> => {
    const houseRef = doc(db, 'houses', houseId);
    await updateDoc(houseRef, data);
}

// --- Reading Functions ---

export const addReading = async (houseId: string, reading: Omit<Reading, 'id'>): Promise<Reading | null> => {
    const readingData = { ...reading, isBillingCycleStart: reading.isBillingCycleStart || false };
    const docRef = await addDoc(collection(db, 'houses', houseId, 'readings'), readingData);
    return { id: docRef.id, ...readingData };
}

export const getReadings = async (houseId: string): Promise<Reading[]> => {
    const querySnapshot = await getDocs(collection(db, 'houses', houseId, 'readings'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reading));
}


// --- Join Request Functions ---

export const createJoinRequest = async (houseId: string, requesterId: string, requesterName: string): Promise<void> => {
    await addDoc(collection(db, 'joinRequests'), {
        houseId,
        requesterId,
        requesterName,
        status: 'pending'
    });
}

export const getJoinRequests = async (houseId: string): Promise<JoinRequest[]> => {
    const q = query(collection(db, 'joinRequests'), where("houseId", "==", houseId), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ requestId: doc.id, ...doc.data() } as JoinRequest));
}

export const updateJoinRequest = async (requestId: string, status: 'approved' | 'rejected'): Promise<void> => {
    const requestRef = doc(db, 'joinRequests', requestId);
    if (status === 'approved' || status === 'rejected') {
        // We delete resolved requests to keep the collection clean.
        await deleteDoc(requestRef);
    }
}
