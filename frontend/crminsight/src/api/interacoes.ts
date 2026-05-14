import type { Interacao, InteracaoFormData } from '../types'
import { get, post, del } from './client'

export function listarInteracoes(): Promise<Interacao[]> {
  return get<Interacao[]>('/interacoes')
}

export function listarInteracoesPorCliente(clienteId: string): Promise<Interacao[]> {
  return get<Interacao[]>(`/interacoes?clienteId=${clienteId}`)
}

export function listarInteracoesPorVendedor(vendedorId: string): Promise<Interacao[]> {
  return get<Interacao[]>(`/interacoes?vendedorId=${vendedorId}`)
}

export function buscarInteracao(id: string): Promise<Interacao> {
  return get<Interacao>(`/interacoes/${id}`)
}

export function criarInteracao(data: InteracaoFormData): Promise<Interacao> {
  return post<Interacao>('/interacoes', data)
}

export function deletarInteracao(id: string): Promise<void> {
  return del<void>(`/interacoes/${id}`)
}
