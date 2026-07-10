import { db } from './config.js'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'

export { db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc }
