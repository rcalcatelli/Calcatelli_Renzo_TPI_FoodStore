import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { FormField, Input } from '../../../shared/ui/Input'
import { largo } from '../../../shared/utils/validaciones'
import { useAuthStore } from '../../../store/authStore'
import { AuthCard } from '../components/AuthCard'
import type { LoginInput } from '../types/auth'

const VALORES_INICIALES: LoginInput = { username: '', password: '' }

export function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const login = useAuthStore((s) => s.login)
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  // Si venía de una ruta protegida, vuelve ahí después de ingresar
  const desde = (location.state as { desde?: string } | null)?.desde

  const form = useForm({
    defaultValues: VALORES_INICIALES,
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        // Al quedar con usuario, el <Navigate> de abajo hace la redirección
        await login({ username: value.username.trim(), password: value.password })
      } catch (e) {
        setError(handleApiError(e))
      }
    },
  })

  if (usuario && !cargando) {
    return <Navigate to={desde ?? (usuario.role === 'admin' ? '/admin' : '/')} replace />
  }

  return (
    <AuthCard
      titulo="Ingresar"
      subtitulo="Accedé con tu usuario para confirmar pedidos."
      pie={
        <>
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-semibold text-orange-600 hover:underline">
            Registrate
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
        <form.Field name="username" validators={{ onChange: largo(1, 50, 'El usuario') }}>
          {(field) => (
            <FormField
              id={field.name}
              label="Usuario"
              errores={field.state.meta.errors}
              mostrarErrores={field.state.meta.isTouched}
            >
              <Input
                id={field.name}
                autoComplete="username"
                autoFocus
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                invalido={field.state.meta.isTouched && !field.state.meta.isValid}
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="password" validators={{ onChange: largo(1, 72, 'La contraseña') }}>
          {(field) => (
            <FormField
              id={field.name}
              label="Contraseña"
              errores={field.state.meta.errors}
              mostrarErrores={field.state.meta.isTouched}
            >
              <Input
                id={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                invalido={field.state.meta.isTouched && !field.state.meta.isValid}
              />
            </FormField>
          )}
        </form.Field>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([puedeEnviar, enviando]) => (
            <Button type="submit" disabled={!puedeEnviar} cargando={enviando} className="mt-2">
              Ingresar
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  )
}
