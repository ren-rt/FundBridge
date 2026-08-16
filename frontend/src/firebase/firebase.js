import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCTriFGsnPjz1iTe7qLjbrKthD0sdAc6XA',
  authDomain: 'fundbridge-cf4e7.firebaseapp.com',
  projectId: 'fundbridge-cf4e7',
  storageBucket: 'fundbridge-cf4e7.firebasestorage.app',
  messagingSenderId: '691243016834',
  appId: '1:691243016834:web:709bc9fec3c7ff49918a9b',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)