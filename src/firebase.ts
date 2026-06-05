import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { AHSPItem, Component } from "./types";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google login popup helper
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Auth helper login error:", error);
    throw error;
  }
}

// Log out helper
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Auth helper logout error:", error);
    throw error;
  }
}

// Define error handling enum and interface as per Firebase Integration skill guidelines
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
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Save Custom AHSP to Cloud Firestore
export async function saveCustomAhspToCloud(ahsp: AHSPItem, userId: string) {
  const path = `custom_ahsp/${ahsp.id}`;
  try {
    await setDoc(doc(db, "custom_ahsp", ahsp.id), {
      id: ahsp.id,
      name: ahsp.name,
      unit: ahsp.unit,
      isCustom: true,
      coefficients: ahsp.coefficients,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Custom AHSP from Cloud Firestore
export async function deleteCustomAhspFromCloud(ahspId: string) {
  const path = `custom_ahsp/${ahspId}`;
  try {
    await deleteDoc(doc(db, "custom_ahsp", ahspId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save Custom Component to Cloud Firestore
export async function saveCustomComponentToCloud(component: Component, userId: string) {
  const path = `custom_components/${component.id}`;
  try {
    await setDoc(doc(db, "custom_components", component.id), {
      id: component.id,
      name: component.name,
      category: component.category,
      unit: component.unit,
      defaultPrice: component.defaultPrice,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Custom Component from Cloud Firestore
export async function deleteCustomComponentFromCloud(componentId: string) {
  const path = `custom_components/${componentId}`;
  try {
    await deleteDoc(doc(db, "custom_components", componentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Real-time custom AHSPs subscription
export function subscribeCustomAhsps(userId: string, onUpdate: (items: AHSPItem[]) => void) {
  const q = query(collection(db, "custom_ahsp"), where("userId", "==", userId));
  const unsub = onSnapshot(q, (snapshot) => {
    const list: AHSPItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: data.id,
        name: data.name,
        unit: data.unit,
        coefficients: data.coefficients || [],
        isCustom: true,
      });
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "custom_ahsp");
  });
  return unsub;
}

// Real-time custom components subscription
export function subscribeCustomComponents(userId: string, onUpdate: (items: Component[]) => void) {
  const q = query(collection(db, "custom_components"), where("userId", "==", userId));
  const unsub = onSnapshot(q, (snapshot) => {
    const list: Component[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: data.id,
        name: data.name,
        category: data.category,
        unit: data.unit,
        defaultPrice: data.defaultPrice || 0,
      });
    });
    onUpdate(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, "custom_components");
  });
  return unsub;
}

// Validate connection on load as required by Firestore integration skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Please check your Firebase configuration: Client is offline.");
    }
  }
}
testConnection();
