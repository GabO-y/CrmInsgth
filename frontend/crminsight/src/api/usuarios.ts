import type { Usuario, UsuarioFormData } from '../types'
import { get, post } from './client'

export function listarUsuarios(): Promise<Usuario[]> {
  return get<Usuario[]>('/usuarios')
}

export function buscarUsuario(id: string): Promise<Usuario> {
  return get<Usuario>(`/usuarios/${id}`)
}

export function criarUsuario(data: UsuarioFormData): Promise<Usuario> {
  return post<Usuario>('/usuarios', data)
}
