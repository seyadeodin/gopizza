import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'

type User = {
  id: string;
  name: string;
  isAdmin: boolean;
}

type AuthContextData =  {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  isLogging: boolean;
  user: User | null;
}

type AuthProviderProps = {
  children: ReactNode;
}

const USER_COLLECTION = '@gopizza:users';

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [ isLogging , setIsLogging ] = useState(false);
  const [ user, setUser ] = useState<User | null>(null);

  async function loadUserStorageData(){
    setIsLogging(true);

    const storedUser = await AsyncStorage.getItem(USER_COLLECTION);

    if(storedUser) {
      const userData = JSON.parse(storedUser) as User;
      console.log(userData)
      setUser(userData);
    }

    setIsLogging(false)
  }

  useEffect(() => {
    loadUserStorageData();
  }, [])
  

  async function signIn(email: string, password: string){
    if(!email || !password){
      return Alert.alert('Login', 'Informe o e-mail e/ou senha. ');
    }

    setIsLogging(true);

    auth()
    .signInWithEmailAndPassword(email, password)
    .then(account => {
      firestore()
      .collection('users')
      .doc(account.user.uid)
      .get()
      .then(async (profile) => {
        const { name, isAdmin } = profile.data() as User;

        if(profile.exists){
          const userData = {
            id: account.user.uid,
            name,
            isAdmin,
          };

          console.log(userData)

          await AsyncStorage.setItem(USER_COLLECTION, JSON.stringify(userData))
          setUser(userData);
        }
      })
      .catch(() => Alert.alert('Login', 'N??o foi poss??vel bucar os dados de perfil do usu??rio'))

    })
    .catch(error => {
      const { code } = error;
      console.log( error )

      if(code === 'auth/user-not-found' || code == 'auth/wrong-password') {
        return Alert.alert('Login', 'Email e/ou senha inv??lida');
      } else {
        return Alert.alert('Login', 'N??o foi poss??vel realizar o login');
      }
    })
    .finally(() => setIsLogging(false))
  }

  async function signOut() {
    await auth().signOut();
    await AsyncStorage.removeItem(USER_COLLECTION);
    setUser(null)
  }

  async function forgotPassword(email: string) {
    if(!email) {
      return Alert.alert('Redefinir senha', 'Informe o e-mail.');
    }

    setIsLogging(true)
    auth()
    .sendPasswordResetEmail(email)
    .then(() => Alert.alert('Redefinir senha', 'Enviamos um link no seu e-mail para redefinir a senha'))
    .catch(() => Alert.alert('Redefnir senha', 'N??o foi poss??vel enviar o e-mail para redefinir a senha'))
    .finally(() => setIsLogging(false))
  }

  return(
    <AuthContext.Provider value={{
      signIn, 
      signOut, 
      forgotPassword,
      isLogging, 
      user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth(){
  const context = useContext(AuthContext);

  return context;
}

export {
  AuthProvider,
  useAuth
}