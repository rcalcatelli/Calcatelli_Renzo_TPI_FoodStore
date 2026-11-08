export type Rol = 'user' | 'admin'

// Espeja UserPublic del backend (nunca incluye la contraseña ni el token)
export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

export interface LoginInput {
  username: string
  password: string
}

export interface RegisterInput {
  username: string
  full_name: string
  email: string
  password: string
}

export interface MensajeRespuesta {
  message: string
}
