package com.flashybank.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flashybank.dto.InitiateTransferRequest;
import com.flashybank.dto.TransactionHistoryResponse;
import com.flashybank.dto.TransactionResponse;
import com.flashybank.model.User;
import com.flashybank.repository.UserRepository;
import com.flashybank.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @org.springframework.boot.test.mock.mockito.MockBean
    private TransactionService transactionService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private UserRepository userRepository;

    private User testUser;
    private InitiateTransferRequest transferRequest;
    private TransactionResponse transactionResponse;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setBalance(new BigDecimal("1000.00"));
        testUser.setRole("USER");
        testUser.setEnabled(true);

        transferRequest = new InitiateTransferRequest();
        transferRequest.setReceiverUsername("receiver");
        transferRequest.setAmount(new BigDecimal("100.00"));
        transferRequest.setDescription("Test transfer");

        transactionResponse = new TransactionResponse();
        transactionResponse.setId(1L);
        transactionResponse.setReceiverUsername("receiver");
        transactionResponse.setAmount(new BigDecimal("100.00"));
        transactionResponse.setDescription("Test transfer");
        transactionResponse.setStatus("PENDING");
        transactionResponse.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @WithMockUser(username = "testuser")
    void testInitiateTransferEndpointSuccess() throws Exception {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.initiateTransfer(eq(1L), any(InitiateTransferRequest.class)))
                .thenReturn(transactionResponse);

        // When & Then
        mockMvc.perform(post("/api/transactions/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transferRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.receiverUsername").value("receiver"))
                .andExpect(jsonPath("$.amount").value(100.00))
                .andExpect(jsonPath("$.status").value("PENDING"));

        verify(transactionService, times(1)).initiateTransfer(eq(1L), any(InitiateTransferRequest.class));
    }

    @Test
    void testInitiateTransferEndpointUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/transactions/initiate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transferRequest)))
                .andExpect(status().isUnauthorized());

        verify(transactionService, never()).initiateTransfer(anyLong(), any(InitiateTransferRequest.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testConfirmTransferEndpointSuccess() throws Exception {
        // Given
        transactionResponse.setStatus("COMPLETED");
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.confirmTransfer(1L, 1L)).thenReturn(transactionResponse);

        // When & Then
        mockMvc.perform(post("/api/transactions/confirm/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        verify(transactionService, times(1)).confirmTransfer(1L, 1L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void testConfirmTransferEndpointNotFound() throws Exception {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.confirmTransfer(999L, 1L))
                .thenThrow(new com.flashybank.exception.TransactionNotFoundException("Transacción no encontrada"));

        // When & Then
        mockMvc.perform(post("/api/transactions/confirm/999"))
                .andExpect(status().isNotFound());

        verify(transactionService, times(1)).confirmTransfer(999L, 1L);
    }

    @Test
    void testConfirmTransferEndpointUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/transactions/confirm/1"))
                .andExpect(status().isUnauthorized());

        verify(transactionService, never()).confirmTransfer(anyLong(), anyLong());
    }

    @Test
    @WithMockUser(username = "testuser")
    void testCancelTransferEndpointSuccess() throws Exception {
        // Given
        transactionResponse.setStatus("CANCELLED");
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.cancelTransfer(1L, 1L)).thenReturn(transactionResponse);

        // When & Then
        mockMvc.perform(post("/api/transactions/cancel/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(transactionService, times(1)).cancelTransfer(1L, 1L);
    }

    @Test
    void testCancelTransferEndpointUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/transactions/cancel/1"))
                .andExpect(status().isUnauthorized());

        verify(transactionService, never()).cancelTransfer(anyLong(), anyLong());
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetHistoryEndpointSuccess() throws Exception {
        // Given
        TransactionHistoryResponse historyResponse = new TransactionHistoryResponse(
                1L,
                "receiver",
                new BigDecimal("100.00"),
                "COMPLETED",
                "SENT",
                "Test transfer",
                LocalDateTime.now()
        );

        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.getTransactionHistory(1L))
                .thenReturn(Arrays.asList(historyResponse));

        // When & Then
        mockMvc.perform(get("/api/transactions/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].receiverUsername").value("receiver"))
                .andExpect(jsonPath("$[0].amount").value(100.00))
                .andExpect(jsonPath("$[0].type").value("SENT"));

        verify(transactionService, times(1)).getTransactionHistory(1L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetTransactionByIdEndpointSuccess() throws Exception {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.getTransactionById(1L, 1L)).thenReturn(transactionResponse);

        // When & Then
        mockMvc.perform(get("/api/transactions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.receiverUsername").value("receiver"));

        verify(transactionService, times(1)).getTransactionById(1L, 1L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void testGetTransactionByIdEndpointUnauthorized() throws Exception {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.getTransactionById(1L, 1L))
                .thenThrow(new com.flashybank.exception.UnauthorizedTransactionException("No autorizado"));

        // When & Then
        mockMvc.perform(get("/api/transactions/1"))
                .andExpect(status().isForbidden());

        verify(transactionService, times(1)).getTransactionById(1L, 1L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void testTransferDirectEndpointSuccess() throws Exception {
        // Given
        transactionResponse.setStatus("COMPLETED");
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.transferDirect(eq(1L), eq("receiver"), eq(new BigDecimal("100.00")), eq("Test transfer")))
                .thenReturn(transactionResponse);

        // When & Then
        mockMvc.perform(post("/api/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transferRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        verify(transactionService, times(1)).transferDirect(eq(1L), eq("receiver"), eq(new BigDecimal("100.00")), eq("Test transfer"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testTransferDirectEndpointSameUser() throws Exception {
        // Given
        transferRequest.setReceiverUsername("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.transferDirect(eq(1L), eq("testuser"), any(), any()))
                .thenThrow(new IllegalArgumentException("No puedes transferirte dinero a ti mismo"));

        // When & Then
        mockMvc.perform(post("/api/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transferRequest)))
                .andExpect(status().isBadRequest());

        verify(transactionService, times(1)).transferDirect(eq(1L), eq("testuser"), any(), any());
    }

    @Test
    @WithMockUser(username = "testuser")
    void testTransferDirectEndpointInsufficientBalance() throws Exception {
        // Given
        transferRequest.setAmount(new BigDecimal("2000.00"));
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.transferDirect(eq(1L), eq("receiver"), eq(new BigDecimal("2000.00")), eq("Test transfer")))
                .thenThrow(new com.flashybank.exception.InsufficientBalanceException("Saldo insuficiente"));

        // When & Then
        mockMvc.perform(post("/api/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transferRequest)))
                .andExpect(status().isBadRequest());

        verify(transactionService, times(1)).transferDirect(eq(1L), eq("receiver"), eq(new BigDecimal("2000.00")), eq("Test transfer"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void testTransferDirectEndpointReceiverNotFound() throws Exception {
        // Given
        transferRequest.setReceiverUsername("nonexistent");
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(transactionService.transferDirect(eq(1L), eq("nonexistent"), any(), any()))
                .thenThrow(new com.flashybank.exception.UserNotFoundException("Usuario destinatario no encontrado"));

        // When & Then
        mockMvc.perform(post("/api/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transferRequest)))
                .andExpect(status().isNotFound());

        verify(transactionService, times(1)).transferDirect(eq(1L), eq("nonexistent"), any(), any());
    }

    @Test
    void testTransferDirectEndpointUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transferRequest)))
                .andExpect(status().isUnauthorized());

        verify(transactionService, never()).transferDirect(anyLong(), anyString(), any(), anyString());
    }
}
