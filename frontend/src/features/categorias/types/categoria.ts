export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

export interface CategoriaInput {
  nombre: string
  descripcion: string | null
}
