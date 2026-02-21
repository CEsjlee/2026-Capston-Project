// src/api/auth.js
import api from './axios';

// 1. 회원가입 경로 수정
export const signup = async (userData) => {
  // 백엔드 @RequestMapping("/api/auth")와 맞춰야 함
  const response = await api.post('/api/auth/signup', userData);
  return response.data;
};

// 2. 로그인 경로 수정
export const login = async (credentials) => {
  // 백ден드 @RequestMapping("/api/auth")와 맞춰야 함
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};