import type { Vendedor, VendedorFormData } from '../types'
import { get, post, put, del } from './client'

export function listarVendedores(): Promise<Vendedor[]> {
  return get<Vendedor[]>('/vendedores')
}

export function buscarVendedor(id: string): Promise<Vendedor> {
  return get<Vendedor>(`/vendedores/${id}`)
}

export function criarVendedor(data: VendedorFormData): Promise<Vendedor> {
  return post<Vendedor>('/vendedores', data)
}

export function atualizarVendedor(id: string, data: VendedorFormData): Promise<Vendedor> {
  return put<Vendedor>(`/vendedores/${id}`, data)
}

export function deletarVendedor(id: string): Promise<void> {
  return del<void>(`/vendedores/${id}`)
}
