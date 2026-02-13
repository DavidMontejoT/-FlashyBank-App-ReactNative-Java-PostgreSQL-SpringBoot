import apiClient from './apiClient';

export const transactionService = {
  // Obtener saldo
  getBalance: async () => {
    try {
      const response = await apiClient.get('/api/transactions/balance');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get balance error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener saldo',
      };
    }
  },

  // Validar usuario destinatario
  checkUser: async (username) => {
    try {
      const response = await apiClient.get(`/api/users/validate/${username}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Check user error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al validar usuario',
      };
    }
  },

  // Iniciar transferencia
  initiateTransfer: async (receiverUsername, amount, description) => {
    try {
      const response = await apiClient.post('/api/transactions/initiate', {
        receiverUsername,
        amount: parseFloat(amount),
        description,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Initiate transfer error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar transferencia',
      };
    }
  },

  // Transferencia simple (directa sin confirmación)
  transfer: async (receiverUsername, amount, description) => {
    try {
      const response = await apiClient.post('/api/transactions/transfer', {
        receiverUsername,
        amount: parseFloat(amount),
        description,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Transfer error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al transferir',
      };
    }
  },

  // Confirmar transferencia
  confirmTransfer: async (transactionId) => {
    try {
      const response = await apiClient.post(`/api/transactions/confirm/${transactionId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Confirm transfer error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al confirmar transferencia',
      };
    }
  },

  // Cancelar transferencia
  cancelTransfer: async (transactionId) => {
    try {
      const response = await apiClient.post(`/api/transactions/cancel/${transactionId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Cancel transfer error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cancelar transferencia',
      };
    }
  },

  // Obtener historial de transacciones
  getTransactionHistory: async () => {
    try {
      const response = await apiClient.get('/api/transactions/history');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get history error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener historial',
      };
    }
  },

  // Obtener detalles de una transacción
  getTransactionById: async (transactionId) => {
    try {
      const response = await apiClient.get(`/api/transactions/${transactionId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get transaction error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener transacción',
      };
    }
  },
};
