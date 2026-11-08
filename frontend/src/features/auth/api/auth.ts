import { api } from '../../../shared/api/axiosInstance'
import type { LoginInput, MensajeRespuesta, RegisterInput, Usuario } from '../types/auth'

// El login es un formulario OAuth2 (application/x-www-form-urlencoded), no JSON
export async function login({ username, password }: LoginInput): Promise<MensajeRespuesta> {
  const form = new URLSearchParams({ username, password })
  const { data } = await api.post<MensajeRespuesta>('/auth/token', form)
  return data
}

export async function register(input: RegisterInput): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/register', input)
  return data
}

export async function logout(): Promise<MensajeRespuesta> {
  const { data } = await api.post<MensajeRespuesta>('/auth/logout')
  return data
}

export async function getMe(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}
