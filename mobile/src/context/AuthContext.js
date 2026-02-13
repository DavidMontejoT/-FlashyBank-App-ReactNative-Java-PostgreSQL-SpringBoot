import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { userService } from '../services/userService';

// Crear el contexto
const AuthContext = createContext(null);

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar usuario al iniciar la app
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const hasTokens = await storageService.hasTokens();

      if (hasTokens) {
        // Si hay tokens, intentar obtener el perfil del usuario
        let profileResponse = await userService.getProfile();

        // Si falla por 401, intentar refrescar el token
        if (!profileResponse.success && profileResponse.status === 401) {
          const refreshToken = await storageService.getRefreshToken();
          if (refreshToken) {
            const refreshResponse = await authService.refreshToken(refreshToken);

            if (refreshResponse.success) {
              // Reintentar obtener el perfil con el nuevo token
              profileResponse = await userService.getProfile();
            }
          }
        }

        if (profileResponse.success) {
          setUser(profileResponse.data);
          setIsAuthenticated(true);
        } else {
          // Si falla definitivamente, limpiar tokens
          await storageService.clearTokens();
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(username, password);

      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Error al iniciar sesión' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, password) => {
    setIsLoading(true);
    try {
      const response = await authService.register(username, password);

      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Error al registrar' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refreshToken = await storageService.getRefreshToken();
      await authService.logout(refreshToken);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Incluso si hay error, limpiar el estado local
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    try {
      const profileResponse = await userService.getProfile();

      if (profileResponse.success) {
        setUser(profileResponse.data);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
