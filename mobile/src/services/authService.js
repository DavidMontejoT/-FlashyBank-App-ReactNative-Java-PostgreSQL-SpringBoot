import apiClient from './apiClient';
import { storageService } from './storageService';

export const authService = {
  // Login de usuario
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        username,
        password,
      });

      const { accessToken, refreshToken, ...userData } = response.data;

      // Guardar tokens de forma segura
      await storageService.saveTokens(accessToken, refreshToken);

      return {
        success: true,
        user: userData,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  },

  // Registro de usuario
  register: async (username, password) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        username,
        password,
      });

      const { accessToken, refreshToken, ...userData } = response.data;

      // Guardar tokens de forma segura
      await storageService.saveTokens(accessToken, refreshToken);

      return {
        success: true,
        user: userData,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar usuario',
      };
    }
  },

  // Logout
  logout: async (refreshToken) => {
    try {
      await apiClient.post('/api/auth/logout', {
        refreshToken,
      });

      // Eliminar tokens del almacenamiento local
      await storageService.clearTokens();

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);

      // Incluso si falla el logout en el servidor, eliminar tokens locales
      await storageService.clearTokens();

      return {
        success: false,
        error: error.response?.data?.message || 'Error al cerrar sesión',
      };
    }
  },

  // Renovar token
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiClient.post('/api/auth/refresh', {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Guardar nuevos tokens
      await storageService.saveTokens(accessToken, newRefreshToken);

      return {
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al renovar token',
      };
    }
  },
};
