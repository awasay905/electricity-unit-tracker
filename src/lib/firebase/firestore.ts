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
  //console.log('createUser: Sending data', { uid, name, email });
  try {
    await setDoc(doc(db, 'users', uid), { uid, name, email, houseId: null });
    //console.log('createUser: Success');
  } catch (error) {
    //console.error('createUser: Error', error);
    throw error;
  }
};

export const getUser = async (uid: string): Promise<User | null> => {
  //console.log('getUser: Requesting user with uid', uid);
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    const result = docSnap.exists() ? (docSnap.data() as User) : null;
    //console.log('getUser: Success', result);
    return result;
  } catch (error) {
    //console.error('getUser: Error', error);
    throw error;
  }
};

export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  //console.log('updateUser: Updating user', { uid, data });
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
    //console.log('updateUser: Success');
  } catch (error) {
    //console.error('updateUser: Error', error);
    throw error;
  }
};

export const addUserToHouse = async (uid: string, houseId: string): Promise<void> => {
  //console.log('addUserToHouse: Adding user to house', { uid, houseId });
  try {
    await updateUser(uid, { houseId });
    //console.log('addUserToHouse: Success');
  } catch (error) {
    //console.error('addUserToHouse: Error', error);
    throw error;
  }
};

export const removeUserFromHouse = async (uid: string): Promise<void> => {
  //console.log('removeUserFromHouse: Removing user from house', { uid });
  try {
    await updateUser(uid, { houseId: null });
    //console.log('removeUserFromHouse: Success');
  } catch (error) {
    //console.error('removeUserFromHouse: Error', error);
    throw error;
  }
};

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
  //console.log('createHouse: Creating house with data', houseData);
  try {
    const docRef = await addDoc(collection(db, 'houses'), houseData);
    //console.log('createHouse: House created with ID', docRef.id);
    await addUserToHouse(ownerId, docRef.id);

    // Add the initial billing reading
    const initialReadingData = {
      value: billingCycleStart.units,
      date: billingCycleStart.date,
      isBillingCycleStart: true,
    };
    //console.log('createHouse: Adding initial billing reading', initialReadingData);
    await addDoc(collection(db, 'houses', docRef.id, 'readings'), initialReadingData);
    //console.log('createHouse: Initial billing reading added');

    const newHouseData = await getDoc(doc(db, 'houses', docRef.id));
    const result = newHouseData.exists() ? ({ id: newHouseData.id, ...newHouseData.data() } as House) : null;
    //console.log('createHouse: Success', result);
    return result;
  } catch (error) {
    //console.error('createHouse: Error', error);
    throw error;
  }
};

export const getHouse = async (houseId: string): Promise<House | null> => {
  //console.log('getHouse: Requesting house with ID', houseId);
  try {
    const docRef = doc(db, 'houses', houseId);
    const docSnap = await getDoc(docRef);
    const result = docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as House) : null;
    //console.log('getHouse: Success', result);
    return result;
  } catch (error) {
    //console.error('getHouse: Error', error);
    throw error;
  }
};

export const getHouseByJoinCode = async (joinCode: string): Promise<House | null> => {
  //console.log('getHouseByJoinCode: Requesting house with join code', joinCode);
  try {
    const q = query(collection(db, "houses"), where("joinCode", "==", joinCode));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      //console.log('getHouseByJoinCode: No house found');
      return null;
    }
    const docSnap = querySnapshot.docs[0];
    const result = { id: docSnap.id, ...docSnap.data() } as House;
    //console.log('getHouseByJoinCode: Success', result);
    return result;
  } catch (error) {
    //console.error('getHouseByJoinCode: Error', error);
    throw error;
  }
};

export const getHouseMembers = async (houseId: string): Promise<User[]> => {
  //console.log('getHouseMembers: Requesting members for house', houseId);
  try {
    const q = query(collection(db, "users"), where("houseId", "==", houseId));
    const querySnapshot = await getDocs(q);
    const result = querySnapshot.docs.map(doc => doc.data() as User);
    //console.log('getHouseMembers: Success', result);
    return result;
  } catch (error) {
    //console.error('getHouseMembers: Error', error);
    throw error;
  }
};

export const updateHouse = async (houseId: string, data: Partial<House>): Promise<void> => {
  //console.log('updateHouse: Updating house', { houseId, data });
  try {
    const houseRef = doc(db, 'houses', houseId);
    await updateDoc(houseRef, data);
    //console.log('updateHouse: Success');
  } catch (error) {
    //console.error('updateHouse: Error', error);
    throw error;
  }
};

// --- Reading Functions ---

export const addReading = async (houseId: string, reading: Omit<Reading, 'id'>): Promise<Reading | null> => {
  const readingData = { ...reading, isBillingCycleStart: reading.isBillingCycleStart || false };
  //console.log('addReading: Adding reading to house', { houseId, readingData });
  try {
    const docRef = await addDoc(collection(db, 'houses', houseId, 'readings'), readingData);
    const result = { id: docRef.id, ...readingData };
    //console.log('addReading: Success', result);
    return result;
  } catch (error) {
    //console.error('addReading: Error', error);
    throw error;
  }
};

export const getReadings = async (houseId: string): Promise<Reading[]> => {
  //console.log('getReadings: Requesting readings for house', houseId);
  try {
    const querySnapshot = await getDocs(collection(db, 'houses', houseId, 'readings'));
    const result = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reading));
    //console.log('getReadings: Success', result);
    return result;
  } catch (error) {
    //console.error('getReadings: Error', error);
    throw error;
  }
};

// --- Join Request Functions ---

export const createJoinRequest = async (houseId: string, requesterId: string, requesterName: string): Promise<void> => {
  //console.log('createJoinRequest: Creating join request', { houseId, requesterId, requesterName });
  try {
    await addDoc(collection(db, 'joinRequests'), {
      houseId,
      requesterId,
      requesterName,
      status: 'pending',
    });
    //console.log('createJoinRequest: Success');
  } catch (error) {
    //console.error('createJoinRequest: Error', error);
    throw error;
  }
};

export const getJoinRequests = async (houseId: string): Promise<JoinRequest[]> => {
  //console.log('getJoinRequests: Requesting join requests for house', houseId);
  try {
    const q = query(collection(db, 'joinRequests'), where("houseId", "==", houseId), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const result = querySnapshot.docs.map(doc => ({ requestId: doc.id, ...doc.data() } as JoinRequest));
    //console.log('getJoinRequests: Success', result);
    return result;
  } catch (error) {
    //console.error('getJoinRequests: Error', error);
    throw error;
  }
};

export const updateJoinRequest = async (requestId: string, status: 'approved' | 'rejected'): Promise<void> => {
  //console.log('updateJoinRequest: Updating join request', { requestId, status });
  try {
    const requestRef = doc(db, 'joinRequests', requestId);
    if (status === 'approved' || status === 'rejected') {
      // We delete resolved requests to keep the collection clean.
      await deleteDoc(requestRef);
      //console.log('updateJoinRequest: Request deleted');
    }
    //console.log('updateJoinRequest: Success');
  } catch (error) {
    //console.error('updateJoinRequest: Error', error);
    throw error;
  }
};
