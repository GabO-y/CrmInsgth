import type { Analitico } from '../types'
import { get } from './client'

export function taxaConversao(vendedorId: string): Promise<Analitico> {
  return get<Analitico>(`/analitico/taxa-conversao?vendedorId=${vendedorId}`)
}

export function ticketMedio30d(clienteId: string): Promise<Analitico> {
  return get<Analitico>(`/analitico/ticket-medio-30d?clienteId=${clienteId}`)
}

export function churnProbabilidade(clienteId: string): Promise<Analitico> {
  return get<Analitico>(`/analitico/churn?clienteId=${clienteId}`)
}

export function eficienciaVendedor(vendedorId: string): Promise<Analitico> {
  return get<Analitico>(`/analitico/eficiencia-vendedor?vendedorId=${vendedorId}`)
}

export function performanceMeta(vendedorId: string): Promise<Analitico> {
  return get<Analitico>(`/analitico/performance-meta?vendedorId=${vendedorId}`)
}

export function especializacao(vendedorId: string): Promise<Analitico> {
  return get<Analitico>(`/analitico/especializacao?vendedorId=${vendedorId}`)
}

export function meuTaxaConversao(): Promise<Analitico> {
  return get<Analitico>('/analitico/meu/taxa-conversao')
}

export function meuEficienciaVendedor(): Promise<Analitico> {
  return get<Analitico>('/analitico/meu/eficiencia-vendedor')
}

export function meuPerformanceMeta(): Promise<Analitico> {
  return get<Analitico>('/analitico/meu/performance-meta')
}

export function meuEspecializacao(): Promise<Analitico> {
  return get<Analitico>('/analitico/meu/especializacao')
}
