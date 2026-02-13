import * as SecureStore from 'expo-secure-store';

const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
};

export const storageService = {
  // Guardar tokens
  saveTokens: async (accessToken, refreshToken) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, accessToken);
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, refreshToken);
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw error;
    }
  },

  // Obtener access token
  getAccessToken: async () => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Obtener refresh token
  getRefreshToken: async () => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  // Eliminar tokens (logout)
  clearTokens: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  },

  // Verificar si hay tokens guardados
  hasTokens: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
      return accessToken !== null;
    } catch (error) {
      console.error('Error checking tokens:', error);
      return false;
    }
  },
};
