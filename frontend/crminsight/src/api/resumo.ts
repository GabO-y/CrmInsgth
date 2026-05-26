import type { ResumoGeral } from '../types'
import { get } from './client'

export function resumoGeral(): Promise<ResumoGeral> {
  return get<ResumoGeral>('/analitico/resumo-geral')
}
