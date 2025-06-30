import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDXxGvAaldYqYysPQHlMkQXbOVTpaxnjuA",
  authDomain: "chikh-counter.firebaseapp.com",
  projectId: "chikh-counter",
  storageBucket: "chikh-counter.firebasestorage.app",
  messagingSenderId: "600153083247",
  appId: "1:600153083247:web:f214631934a7f62d25ec9a"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app) 