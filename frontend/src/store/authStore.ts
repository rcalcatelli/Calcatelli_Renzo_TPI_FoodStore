import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../features/auth/api/auth'
import type { LoginInput, Usuario } from '../features/auth/types/auth'

interface AuthState {
  usuario: Usuario | null
  cargando: boolean
  login: (input: LoginInput) => Promise<Usuario>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

// Estado de sesión del cliente. El token vive solo en la cookie HttpOnly:
// acá se guarda el usuario (nombre, email y rol) para pintar la interfaz.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (input) => {
        await authApi.login(input)
        const usuario = await authApi.getMe()
        set({ usuario, cargando: false })
        return usuario
      },

      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          set({ usuario: null })
        }
      },

      // Se llama una vez al montar la aplicación: confirma con /auth/me si la cookie sigue vigente
      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await authApi.getMe()
          set({ usuario, cargando: false })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },

      limpiarSesion: () => set({ usuario: null, cargando: false }),
    }),
    {
      name: 'foodstore-auth',
      // Solo se persiste el usuario; nunca el token
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
