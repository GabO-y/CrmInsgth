export type RoleUsuario = 'ADMIN' | 'VENDEDOR' | 'CLIENTE'

export type StatusVenda = 'CONCLUIDA' | 'CANCELADA' | 'EM_ANALISE'

export type CanalInteracao = 'TELEFONE' | 'EMAIL' | 'WHATSAPP' | 'REUNIAO'

export type RankVendedor = 'OURO' | 'PRATA' | 'BRONZE' | 'TREINAMENTO'

export interface Usuario {
  id: string
  username: string
  role: RoleUsuario
  vendedorId: string | null
  clienteId: string | null
}

export interface LoginResponse {
  token: string
  usuario: Usuario
}

export interface Cliente {
  id: string
  nome: string
  segmento: string
  dataEntrada: string
  score: number
}

export interface Vendedor {
  id: string
  nome: string
  matricula: string
  dataAdmissao: string
  metaMensal: number
  comissaoBase: number
  rank: RankVendedor
}

export interface Venda {
  id: string
  data: string
  valor: number
  status: StatusVenda
  comissaoPaga: number
  clienteId: string
  clienteNome: string
  vendedorId: string
  vendedorNome: string
}

export interface Interacao {
  id: string
  dataHora: string
  canal: CanalInteracao
  duracao: number
  avaliacao: number
  clienteId: string
  clienteNome: string
  vendedorId: string
  vendedorNome: string
}

export interface Analitico {
  metrica: string
  valor: number
  unidade: string
}

export interface ClienteFormData {
  nome: string
  segmento: string
}

export interface VendedorFormData {
  nome: string
  matricula: string
  dataAdmissao: string
  metaMensal: number
  comissaoBase: number
  rank: RankVendedor
}

export interface UsuarioFormData {
  username: string
  password: string
  role: RoleUsuario
  nome?: string
  matricula?: string
  dataAdmissao?: string
  metaMensal?: number
  comissaoBase?: number
  rank?: string
  segmento?: string
}

export interface VendaFormData {
  id: string
  data: string
  valor: number
  status: StatusVenda
  comissaoPaga: number
  clienteId: string
  vendedorId: string
}

export interface InteracaoFormData {
  id: string
  dataHora: string
  canal: CanalInteracao
  duracao: number
  avaliacao: number
  clienteId: string
  vendedorId: string
}



export interface Venda {
  id: string
  data: string
  valor: number
  status: StatusVenda
  comissaoPaga: number
  clienteId: string
  clienteNome: string
  vendedorId: string
  vendedorNome: string
}

export interface Interacao {
  id: string
  dataHora: string
  canal: CanalInteracao
  duracao: number
  avaliacao: number
  clienteId: string
  clienteNome: string
  vendedorId: string
  vendedorNome: string
}

export interface Analitico {
  metrica: string
  valor: number
  unidade: string
}

export interface ClienteFormData {
  nome: string
  segmento: string
}

export interface VendedorFormData {
  nome: string
  matricula: string
  dataAdmissao: string
  metaMensal: number
  comissaoBase: number
  rank: RankVendedor
}

export interface VendaFormData {
  data: string
  valor: number
  status: StatusVenda
  comissaoPaga: number
  clienteId: string
  vendedorId: string
}

export interface InteracaoFormData {
  dataHora: string
  canal: CanalInteracao
  duracao: number
  avaliacao: number
  clienteId: string
  vendedorId: string
}

export interface ResumoGeral {
  totalClientes: number
  totalVendedores: number
  faturamentoTotal: number
  faturamentoMes: number
  totalVendasConcluidas: number
  totalInteracoes: number
  totalVendas: number
  vendasPorMes: { mes: string; valor: number }[]
  topVendedores: { nome: string; total: number }[]
  vendasPorStatus: Record<string, number>
  ultimasVendas: {
    id: string
    data: string
    clienteNome: string
    vendedorNome: string
    valor: number
    status: string
  }[]
  ultimasInteracoes: {
    id: string
    dataHora: string
    clienteNome: string
    canal: string
    duracao: number
  }[]
}

export interface UsuarioFormData {
  username: string
  password: string
  role: RoleUsuario
}
