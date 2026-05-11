import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Use environment variables if available (Vercel), otherwise fallback to the applet config (AI Studio)
// Also ensure we don't crash if these objects are partially missing
const safeConfig = (firebaseAppletConfig as any) || {};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || safeConfig.apiKey || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || safeConfig.authDomain || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || safeConfig.projectId || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || safeConfig.storageBucket || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || safeConfig.messagingSenderId || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || safeConfig.appId || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || safeConfig.databaseURL || "",
};

// Debug: Log config status (masked)
if (import.meta.env.PROD) {
  console.log("Firebase initializing...");
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([k, v]) => !v && k !== 'databaseURL' && k !== 'databaseId')
    .map(([k]) => k);
  
  if (missingKeys.length > 0) {
    console.warn("⚠️ Firebase configuration is partial. Missing keys:", missingKeys);
    console.info("Please ensure VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc. are set in your deployment environment.");
  } else {
    console.log("✅ Firebase configuration keys detected.");
  }
}

let app;
try {
  // Only attempt to init if we have a plausible API key and project ID
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "missing-key" && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
  } else {
    throw new Error("Missing critical Firebase configuration keys (API Key or Project ID).");
  }
} catch (e) {
  console.error("Firebase App initialization failed.", e);
  // Re-init with dummy to prevent downstream crashes, but this won't work for real queries
  app = initializeApp({ apiKey: "invalid-key-placeholder", projectId: "invalid-project-placeholder" });
}

const dbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || safeConfig.firestoreDatabaseId;
export const db = getFirestore(app, (dbId === "default" || !dbId) ? undefined : dbId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('[Nexon Matrix Error]: ', JSON.stringify(errInfo));
  // We do not throw here to prevent crashing the React component tree
  // This allows the app to fallback to local 'Demo Mode' data
  return errInfo;
}

// Connectivity check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connected successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
