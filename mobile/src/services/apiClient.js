import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Base URL para desarrollo
// En desarrollo local: cambiar por tu IP local o usar localhost
// En producción: usar variable de entorno
const getBaseUrl = () => {
  // Opciones para desarrollo:
  // - Web (localhost): 'http://localhost:8080'
  // - Celular (IP local): 'http://192.168.X.X:8080'
  // - Producción: process.env.API_BASE_URL

  // Para Expo Go en celular físico, usar IP local de la Mac
  return 'http://192.168.20.23:8080';

  // Para web o emuladores, usar localhost:
  // return 'http://localhost:8080';
};

const API_BASE_URL = getBaseUrl();

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar el token a cada request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores y refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refresh el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (refreshToken) {
          // Intentar renovar el token
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Guardar nuevos tokens
          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', newRefreshToken);

          // Reintentar la request original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, eliminar tokens y redirigir a login
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
