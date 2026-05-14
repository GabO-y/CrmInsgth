import type { Cliente, ClienteFormData } from '../types'
import { get, post, put, del } from './client'

export function listarClientes(): Promise<Cliente[]> {
  return get<Cliente[]>('/clientes')
}

export function buscarCliente(id: string): Promise<Cliente> {
  return get<Cliente>(`/clientes/${id}`)
}

export function criarCliente(data: ClienteFormData): Promise<Cliente> {
  return post<Cliente>('/clientes', data)
}

export function atualizarCliente(id: string, data: ClienteFormData): Promise<Cliente> {
  return put<Cliente>(`/clientes/${id}`, data)
}

export function deletarCliente(id: string): Promise<void> {
  return del<void>(`/clientes/${id}`)
}
