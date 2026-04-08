import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Register new user and save profile in Firestore
  async function register(email, password, role, name) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const uid = cred.user.uid
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      name,
      role, // 'user' | 'realEstate' | 'admin'
      createdAt: serverTimestamp(),
      subscription: {
        plan: 'free',           // free | monthly | quarterly | yearly
        expiry: null,
        predictionCount: 0,
        listingCount: 0,
      },
      userAccess: {
        plan: 'none',           // none | one-time | monthly
        expiry: null,
        unlockedListings: [],   // list of listing IDs unlocked one-time
      },
    })
    return cred
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    setUserProfile(null)
    return signOut(auth)
  }

  const googleProvider = new GoogleAuthProvider()
  
  async function loginWithGoogle(role = 'user') {
    const result = await signInWithPopup(auth, googleProvider)
    const uid = result.user.uid
    
    // Check if user exists, if not create default profile
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) {
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: result.user.email,
        name: result.user.displayName || 'Google User',
        role: role, 
        createdAt: serverTimestamp(),
        subscription: {
          plan: 'free',
          expiry: null,
          predictionCount: 0,
          listingCount: 0,
        },
        userAccess: {
          plan: 'none',
          expiry: null,
          unlockedListings: [],
        },
      })
    }
    return result
  }

  async function fetchProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      const data = snap.data()
      if (data.role) {
        data.role = data.role.trim()
      }
      setUserProfile(data)
    }
  }

  async function refreshProfile() {
    if (currentUser) await fetchProfile(currentUser.uid)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchProfile(user.uid)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
