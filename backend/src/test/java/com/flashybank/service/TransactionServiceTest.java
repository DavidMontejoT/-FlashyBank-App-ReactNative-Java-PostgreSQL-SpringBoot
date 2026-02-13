package com.flashybank.service;

import com.flashybank.dto.InitiateTransferRequest;
import com.flashybank.dto.TransactionHistoryResponse;
import com.flashybank.dto.TransactionResponse;
import com.flashybank.exception.InsufficientBalanceException;
import com.flashybank.exception.InvalidTransactionStatusException;
import com.flashybank.exception.TransactionNotFoundException;
import com.flashybank.exception.UnauthorizedTransactionException;
import com.flashybank.exception.UserNotFoundException;
import com.flashybank.model.Transaction;
import com.flashybank.model.User;
import com.flashybank.repository.TransactionRepository;
import com.flashybank.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User senderUser;
    private User receiverUser;
    private Transaction pendingTransaction;
    private Transaction completedTransaction;
    private InitiateTransferRequest transferRequest;

    @BeforeEach
    void setUp() {
        senderUser = new User();
        senderUser.setId(1L);
        senderUser.setUsername("sender");
        senderUser.setBalance(new BigDecimal("1000.00"));
        senderUser.setRole("USER");
        senderUser.setEnabled(true);

        receiverUser = new User();
        receiverUser.setId(2L);
        receiverUser.setUsername("receiver");
        receiverUser.setBalance(new BigDecimal("500.00"));
        receiverUser.setRole("USER");
        receiverUser.setEnabled(true);

        pendingTransaction = new Transaction();
        pendingTransaction.setId(1L);
        pendingTransaction.setSenderId(1L);
        pendingTransaction.setReceiverUsername("receiver");
        pendingTransaction.setAmount(new BigDecimal("100.00"));
        pendingTransaction.setDescription("Test transfer");
        pendingTransaction.setStatus("PENDING");
        pendingTransaction.setCreatedAt(LocalDateTime.now());

        completedTransaction = new Transaction();
        completedTransaction.setId(2L);
        completedTransaction.setSenderId(1L);
        completedTransaction.setReceiverUsername("receiver");
        completedTransaction.setAmount(new BigDecimal("100.00"));
        completedTransaction.setDescription("Test transfer");
        completedTransaction.setStatus("COMPLETED");
        completedTransaction.setCreatedAt(LocalDateTime.now());

        transferRequest = new InitiateTransferRequest();
        transferRequest.setReceiverUsername("receiver");
        transferRequest.setAmount(new BigDecimal("100.00"));
        transferRequest.setDescription("Test transfer");
    }

    @Test
    void testInitiateTransferSuccess() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(userRepository.findByUsername("receiver")).thenReturn(Optional.of(receiverUser));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(pendingTransaction);

        // When
        TransactionResponse response = transactionService.initiateTransfer(1L, transferRequest);

        // Then
        assertNotNull(response);
        assertEquals("PENDING", response.getStatus());
        assertEquals("receiver", response.getReceiverUsername());
        assertEquals(new BigDecimal("100.00"), response.getAmount());

        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void testInitiateTransferSameUser() {
        // Given
        transferRequest.setReceiverUsername("sender");
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(userRepository.findByUsername("sender")).thenReturn(Optional.of(senderUser));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> transactionService.initiateTransfer(1L, transferRequest));

        assertTrue(exception.getMessage().contains("ti mismo"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testInitiateTransferInsufficientBalance() {
        // Given
        transferRequest.setAmount(new BigDecimal("2000.00"));
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(userRepository.findByUsername("receiver")).thenReturn(Optional.of(receiverUser));

        // When & Then
        InsufficientBalanceException exception = assertThrows(InsufficientBalanceException.class,
                () -> transactionService.initiateTransfer(1L, transferRequest));

        assertTrue(exception.getMessage().contains("Saldo insuficiente"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testInitiateTransferReceiverNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());
        transferRequest.setReceiverUsername("nonexistent");

        // When & Then
        assertThrows(UserNotFoundException.class,
                () -> transactionService.initiateTransfer(1L, transferRequest));

        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testConfirmTransferSuccess() {
        // Given
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(pendingTransaction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(userRepository.findByUsername("receiver")).thenReturn(Optional.of(receiverUser));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction t = invocation.getArgument(0);
            t.setStatus("COMPLETED");
            return t;
        });
        when(userRepository.save(any(User.class))).thenReturn(senderUser);

        // When
        TransactionResponse response = transactionService.confirmTransfer(1L, 1L);

        // Then
        assertNotNull(response);
        assertEquals("COMPLETED", response.getStatus());

        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(userRepository, times(2)).save(any(User.class));
    }

    @Test
    void testConfirmTransferUnauthorized() {
        // Given
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(pendingTransaction));

        // When & Then
        UnauthorizedTransactionException exception = assertThrows(UnauthorizedTransactionException.class,
                () -> transactionService.confirmTransfer(1L, 2L));

        assertTrue(exception.getMessage().contains("permiso"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testConfirmTransferInvalidStatus() {
        // Given
        when(transactionRepository.findById(2L)).thenReturn(Optional.of(completedTransaction));

        // When & Then
        InvalidTransactionStatusException exception = assertThrows(InvalidTransactionStatusException.class,
                () -> transactionService.confirmTransfer(2L, 1L));

        assertTrue(exception.getMessage().contains("no puede ser confirmada"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testConfirmTransferAlreadyCompleted() {
        // Given
        completedTransaction.setStatus("COMPLETED");
        when(transactionRepository.findById(2L)).thenReturn(Optional.of(completedTransaction));

        // When & Then
        InvalidTransactionStatusException exception = assertThrows(InvalidTransactionStatusException.class,
                () -> transactionService.confirmTransfer(2L, 1L));

        assertTrue(exception.getMessage().contains("no puede ser confirmada"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testCancelTransferSuccess() {
        // Given
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(pendingTransaction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction t = invocation.getArgument(0);
            t.setStatus("CANCELLED");
            return t;
        });

        // When
        TransactionResponse response = transactionService.cancelTransfer(1L, 1L);

        // Then
        assertNotNull(response);
        assertEquals("CANCELLED", response.getStatus());

        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void testCancelTransferUnauthorized() {
        // Given
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(pendingTransaction));

        // When & Then
        UnauthorizedTransactionException exception = assertThrows(UnauthorizedTransactionException.class,
                () -> transactionService.cancelTransfer(1L, 2L));

        assertTrue(exception.getMessage().contains("permiso"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testCancelTransferInvalidStatus() {
        // Given
        when(transactionRepository.findById(2L)).thenReturn(Optional.of(completedTransaction));

        // When & Then
        InvalidTransactionStatusException exception = assertThrows(InvalidTransactionStatusException.class,
                () -> transactionService.cancelTransfer(2L, 1L));

        assertTrue(exception.getMessage().contains("no puede ser cancelada"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testGetTransactionHistorySuccess() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(transactionRepository.findBySenderIdOrderByCreatedAtDesc(1L))
                .thenReturn(Arrays.asList(pendingTransaction));
        when(transactionRepository.findByReceiverUsernameOrderByCreatedAtDesc("sender"))
                .thenReturn(Arrays.asList(completedTransaction));
        when(userRepository.findById(pendingTransaction.getSenderId())).thenReturn(Optional.of(senderUser));
        when(userRepository.findById(completedTransaction.getSenderId())).thenReturn(Optional.of(senderUser));

        // When
        List<TransactionHistoryResponse> history = transactionService.getTransactionHistory(1L);

        // Then
        assertNotNull(history);
        assertEquals(2, history.size());

        verify(userRepository, atLeastOnce()).findById(1L);
        verify(transactionRepository, times(1)).findBySenderIdOrderByCreatedAtDesc(1L);
        verify(transactionRepository, times(1)).findByReceiverUsernameOrderByCreatedAtDesc("sender");
    }

    @Test
    void testGetTransactionByIdSuccess() {
        // Given
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(pendingTransaction));
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));

        // When
        TransactionResponse response = transactionService.getTransactionById(1L, 1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getId());

        verify(transactionRepository, times(1)).findById(1L);
    }

    @Test
    void testGetTransactionByIdUnauthorized() {
        // Given
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(pendingTransaction));

        // When & Then
        UnauthorizedTransactionException exception = assertThrows(UnauthorizedTransactionException.class,
                () -> transactionService.getTransactionById(1L, 2L));

        assertTrue(exception.getMessage().contains("permiso"));
    }

    @Test
    void testTransferDirectSuccess() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(userRepository.findByUsername("receiver")).thenReturn(Optional.of(receiverUser));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(completedTransaction);
        when(userRepository.save(any(User.class))).thenReturn(senderUser);

        // When
        TransactionResponse response = transactionService.transferDirect(
                1L, "receiver", new BigDecimal("100.00"), "Direct transfer");

        // Then
        assertNotNull(response);
        assertEquals("COMPLETED", response.getStatus());

        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(userRepository, times(2)).save(any(User.class));
    }

    @Test
    void testTransferDirectSameUser() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(userRepository.findByUsername("sender")).thenReturn(Optional.of(senderUser));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> transactionService.transferDirect(
                        1L, "sender", new BigDecimal("100.00"), "Direct transfer"));

        assertTrue(exception.getMessage().contains("ti mismo"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testTransferDirectInsufficientBalance() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(userRepository.findByUsername("receiver")).thenReturn(Optional.of(receiverUser));

        // When & Then
        InsufficientBalanceException exception = assertThrows(InsufficientBalanceException.class,
                () -> transactionService.transferDirect(
                        1L, "receiver", new BigDecimal("2000.00"), "Direct transfer"));

        assertTrue(exception.getMessage().contains("Saldo insuficiente"));
        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void testTransferDirectReceiverNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(senderUser));
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(UserNotFoundException.class,
                () -> transactionService.transferDirect(
                        1L, "nonexistent", new BigDecimal("100.00"), "Direct transfer"));

        verify(transactionRepository, never()).save(any(Transaction.class));
    }
}
