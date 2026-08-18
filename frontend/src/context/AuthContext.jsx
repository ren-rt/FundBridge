import { createContext, useContext, useState, useEffect, useRef } from 'react'
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
  const [appUser, setAppUser] = useState(null)
  const [appToken, setAppToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Used only when creating a new account.
  const pendingRoleRef = useRef(null)
  const pendingNameRef = useRef(null)

  // Used so login() can wait for the backend authentication
  // to finish before returning the application user.
  const backendAuthPromiseRef = useRef(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (!firebaseUser) {
        setAppUser(null)
        setAppToken(null)
        pendingRoleRef.current = null
        pendingNameRef.current = null
        backendAuthPromiseRef.current = null
        setLoading(false)
        return
      }

      const authenticateWithBackend = async () => {
        try {
          const idToken = await firebaseUser.getIdToken()

          const body = {
            idToken,
          }

          // During signup, send the selected role.
          if (pendingRoleRef.current) {
            body.role = pendingRoleRef.current
          }

          if (pendingNameRef.current) {
            body.fullName = pendingNameRef.current
          }

          const res = await fetch(
            'http://localhost:3000/api/auth/login',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body),
            }
          )

          const data = await res.json().catch(() => null)

          if (!res.ok) {
            throw new Error(
              data?.message ||
              data?.error ||
              'Backend authentication failed'
            )
          }

          const backendUser = data?.user || null
          const backendToken = data?.token || null

          setAppToken(backendToken)
          setAppUser(backendUser)

          return backendUser
        } catch (err) {
          console.error(
            'Backend token exchange failed:',
            err.message
          )

          setAppUser(null)
          setAppToken(null)

          throw err
        } finally {
          pendingRoleRef.current = null
          pendingNameRef.current = null
          setLoading(false)
        }
      }

      backendAuthPromiseRef.current = authenticateWithBackend()

      try {
        await backendAuthPromiseRef.current
      } catch {
        // Error already handled above.
      }
    })

    return unsubscribe
  }, [])

  async function login(email, password) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  )

  let backendUser = null

  if (backendAuthPromiseRef.current) {
    backendUser = await backendAuthPromiseRef.current
  }

  return {
    firebaseUser: credential.user,
    appUser: backendUser,
  }
}

  async function signup(fullName, email, password, selectedRole) {
    pendingRoleRef.current = selectedRole
    pendingNameRef.current = fullName

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      // Signup's role and name are handled by the backend exchange.
      if (backendAuthPromiseRef.current) {
        await backendAuthPromiseRef.current
      }

      return credential.user
    } catch (err) {
      pendingRoleRef.current = null
      pendingNameRef.current = null
      throw err
    }
  }

  async function logout() {
    await signOut(auth)

    setUser(null)
    setAppUser(null)
    setAppToken(null)

    pendingRoleRef.current = null
    pendingNameRef.current = null
    backendAuthPromiseRef.current = null
  }

  async function getToken() {
    return appToken
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        appToken,
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

// Splitting this hook into its own file would fix the warning properly,
// but requires updating every import site across the app; not worth the
// churn for a dev-experience-only warning.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}