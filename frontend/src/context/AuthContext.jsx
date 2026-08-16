import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [appToken, setAppToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // Temporary frontend role storage.
        // Backend should eventually provide/verify the real role.
        const savedRole = localStorage.getItem(
          `fundbridge_role_${firebaseUser.uid}`
        )

        setRole(savedRole || null)

        try {
          const idToken = await firebaseUser.getIdToken()

          const res = await fetch(
            'http://localhost:3000/api/auth/login',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken }),
            }
          )

          if (res.ok) {
            const data = await res.json()

            setAppToken(data.token)
            localStorage.setItem('appToken', data.token)
          } else {
            console.log(
              'Backend token exchange failed — endpoint may not be ready yet'
            )
          }
        } catch (err) {
          console.log(
            'Backend token exchange failed:',
            err.message
          )
        }
      } else {
        setRole(null)
        setAppToken(null)
        localStorage.removeItem('appToken')
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  async function login(email, password) {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )

    const firebaseUser = credential.user

    const savedRole = localStorage.getItem(
      `fundbridge_role_${firebaseUser.uid}`
    )

    setRole(savedRole || null)

    return firebaseUser
  }

  async function signup(email, password, selectedRole) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    const firebaseUser = credential.user

    // Temporary role storage for the frontend.
    localStorage.setItem(
      `fundbridge_role_${firebaseUser.uid}`,
      selectedRole
    )

    setRole(selectedRole)

    return firebaseUser
  }

  async function logout() {
    await signOut(auth)

    setUser(null)
    setRole(null)
    setAppToken(null)

    localStorage.removeItem('appToken')
  }

  async function getToken() {
    return appToken
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        signup,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}