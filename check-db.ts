
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCategories() {
  console.log("Checking categories...");
  const snap = await getDocs(collection(db, 'serviceCategories'));
  snap.docs.forEach(doc => {
    console.log(`ID: ${doc.id}, Data:`, doc.data());
  });
  
  console.log("\nChecking services...");
  const servicesSnap = await getDocs(collection(db, 'services'));
  servicesSnap.docs.forEach(doc => {
    console.log(`ID: ${doc.id}, Title: ${doc.data().title}, Category: ${doc.data().category}, Enabled: ${doc.data().enabled}`);
  });
}

checkCategories().catch(console.error);
