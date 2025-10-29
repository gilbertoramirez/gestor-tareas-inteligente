import { create } from 'zustand';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth } from '../servicios/firebase';

interface AuthState {
  usuario: User | null;
  cargando: boolean;
  error: string | null;
  
  // Acciones
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrarse: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  inicializarAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  cargando: true,
  error: null,

  iniciarSesion: async (email: string, password: string) => {
    try {
      set({ cargando: true, error: null });
      await signInWithEmailAndPassword(auth, email, password);
      set({ cargando: false });
    } catch (error: any) {
      set({ 
        error: error.message, 
        cargando: false 
      });
      throw error;
    }
  },

  registrarse: async (email: string, password: string) => {
    try {
      set({ cargando: true, error: null });
      await createUserWithEmailAndPassword(auth, email, password);
      set({ cargando: false });
    } catch (error: any) {
      set({ 
        error: error.message, 
        cargando: false 
      });
      throw error;
    }
  },

  cerrarSesion: async () => {
    try {
      await signOut(auth);
      set({ usuario: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  inicializarAuth: () => {
    onAuthStateChanged(auth, (usuario) => {
      set({ usuario, cargando: false });
    });
  }
}));
