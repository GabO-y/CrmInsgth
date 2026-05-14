import type { Venda, VendaFormData } from '../types'
import { get, post, del } from './client'

export function listarVendas(): Promise<Venda[]> {
  return get<Venda[]>('/vendas')
}

export function listarVendasPorCliente(clienteId: string): Promise<Venda[]> {
  return get<Venda[]>(`/vendas?clienteId=${clienteId}`)
}

export function listarVendasPorVendedor(vendedorId: string): Promise<Venda[]> {
  return get<Venda[]>(`/vendas?vendedorId=${vendedorId}`)
}

export function buscarVenda(id: string): Promise<Venda> {
  return get<Venda>(`/vendas/${id}`)
}

export function criarVenda(data: VendaFormData): Promise<Venda> {
  return post<Venda>('/vendas', data)
}

export function deletarVenda(id: string): Promise<void> {
  return del<void>(`/vendas/${id}`)
}
