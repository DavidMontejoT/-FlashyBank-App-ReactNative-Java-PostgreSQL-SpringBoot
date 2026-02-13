import apiClient from './apiClient';

export const userService = {
  // Obtener perfil
  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/users/profile');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Error al obtener perfil',
        status: error.response?.status,
      };
    }
  },

  // Actualizar perfil
  updateProfile: async (username) => {
    try {
      const response = await apiClient.put('/api/users/profile', {
        username,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar perfil',
      };
    }
  },

  // Validar usuario destinatario
  validateUser: async (username) => {
    try {
      const response = await apiClient.get(`/api/users/validate/${username}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Validate user error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al validar usuario',
      };
    }
  },

  // Obtener usuario público
  getUserPublic: async (username) => {
    try {
      const response = await apiClient.get(`/api/users/${username}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get user error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener usuario',
      };
    }
  },

  // Listar usuarios (paginado)
  listUsers: async (page = 0, size = 10, search = '') => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      if (search) {
        params.append('search', search);
      }

      const response = await apiClient.get(`/api/users?${params.toString()}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('List users error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al listar usuarios',
      };
    }
  },
};
