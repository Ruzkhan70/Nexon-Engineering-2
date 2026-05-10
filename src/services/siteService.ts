import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Firestore Error [${operationType}] at [${path}]:`, error);
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {} // Simplified for now
  };
  throw new Error(JSON.stringify(errInfo));
}

// Site Settings
export const getSiteSettings = async () => {
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/global');
  }
};

export const updateSiteSettings = async (data: any) => {
  try {
    await setDoc(doc(db, 'settings', 'global'), data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/global');
  }
};

// Services
export const getServices = async (onlyEnabled = false) => {
  try {
    const servicesRef = collection(db, 'services');
    let q = query(servicesRef, orderBy('order', 'asc'));
    if (onlyEnabled) {
      q = query(servicesRef, where('enabled', '==', true), orderBy('order', 'asc'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'services');
  }
};

export const addService = async (service: any) => {
  try {
    const docRef = await addDoc(collection(db, 'services'), service);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'services');
  }
};

export const updateService = async (id: string, data: any) => {
  try {
    await updateDoc(doc(db, 'services', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `services/${id}`);
  }
};

export const deleteService = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
  }
};

// Projects
export const getProjects = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  }
};

// ... similar functions for Clients, Reviews, Messages ...

// Real-time listeners
export const subscribeToMessages = (callback: (messages: any[]) => void) => {
  const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'messages');
  });
};
