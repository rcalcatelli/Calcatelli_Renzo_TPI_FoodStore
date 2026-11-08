import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { FormField, Input } from '../../../shared/ui/Input'
import { emailValido, largo } from '../../../shared/utils/validaciones'
import { useAuthStore } from '../../../store/authStore'
import { register } from '../api/auth'
import { AuthCard } from '../components/AuthCard'
import type { RegisterInput } from '../types/auth'

const VALORES_INICIALES: RegisterInput = { username: '', full_name: '', email: '', password: '' }

interface CampoRegistro {
  name: keyof RegisterInput
  label: string
  type: string
  autoComplete: string
  ayuda?: string
  validar: ({ value }: { value: string }) => string | undefined
}

const CAMPOS: CampoRegistro[] = [
  { name: 'full_name', label: 'Nombre completo', type: 'text', autoComplete: 'name', validar: largo(2, 100, 'El nombre') },
  { name: 'username', label: 'Usuario', type: 'text', autoComplete: 'username', validar: largo(3, 50, 'El usuario') },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', validar: emailValido },
  {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    autoComplete: 'new-password',
    ayuda: 'Mínimo 8 caracteres',
    validar: largo(8, 72, 'La contraseña'),
  },
]

export function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const login = useAuthStore((s) => s.login)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => {
      setError(null)
      const datos: RegisterInput = {
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
      }
      try {
        await register(datos)
        // Registro exitoso: se inicia la sesión y el <Navigate> de abajo lleva al catálogo
        await login({ username: datos.username, password: datos.password })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (usuario && !cargando) return <Navigate to="/" replace />

  return (
    <AuthCard
      titulo="Crear cuenta"
      subtitulo="Registrate para hacer pedidos."
      pie={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-orange-600 hover:underline">
            Ingresá
          </Link>
        </>
      }
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        {CAMPOS.map((campo) => (
          <form.Field key={campo.name} name={campo.name} validators={{ onChange: campo.validar }}>
            {(field) => (
              <FormField
                id={field.name}
                label={campo.label}
                errores={field.state.meta.errors}
                mostrarErrores={field.state.meta.isTouched}
                ayuda={campo.ayuda}
              >
                <Input
                  id={field.name}
                  type={campo.type}
                  autoComplete={campo.autoComplete}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  invalido={field.state.meta.isTouched && !field.state.meta.isValid}
                />
              </FormField>
            )}
          </form.Field>
        ))}

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puedeEnviar, enviando]) => (
            <Button type="submit" disabled={!puedeEnviar} cargando={enviando} className="mt-2">
              Crear cuenta
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  )
}
