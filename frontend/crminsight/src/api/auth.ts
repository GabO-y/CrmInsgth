import type { LoginResponse } from '../types'
import { post } from './client'

export function login(username: string, password: string): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', { username, password })
}
