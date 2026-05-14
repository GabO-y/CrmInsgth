const BASE_URL = '/api'

interface RequestConfig {
  method?: string
  body?: unknown
  headers?: Record<string, string>
}

export class ApiError extends Error {
  status: number
  details?: string[]

  constructor(status: number, message: string, details?: string[]) {
    super(message)
    this.status = status
    this.details = details
  }
}

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: config.method ?? 'GET',
    headers,
    body: config.body ? JSON.stringify(config.body) : undefined,
  })

  if (!response.ok) {
    let errorMessage = `Erro ${response.status}`
    let details: string[] | undefined

    try {
      const errorBody = await response.json()
      if (errorBody.erro) {
        errorMessage = errorBody.erro
      }
      if (errorBody.detalhes) {
        details = errorBody.detalhes
      }
    } catch {
      // ignore JSON parse error for non-JSON responses
    }

    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }

    throw new ApiError(response.status, errorMessage, details)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path)
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body })
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body })
}

export function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}
