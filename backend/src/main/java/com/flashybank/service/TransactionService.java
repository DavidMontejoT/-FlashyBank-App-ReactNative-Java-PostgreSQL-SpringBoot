package com.flashybank.service;

import com.flashybank.dto.InitiateTransferRequest;
import com.flashybank.dto.TransactionHistoryResponse;
import com.flashybank.dto.TransactionResponse;
import com.flashybank.exception.*;
import com.flashybank.model.Transaction;
import com.flashybank.model.User;
import com.flashybank.repository.TransactionRepository;
import com.flashybank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionResponse initiateTransfer(Long senderId, InitiateTransferRequest request) {
        // 1. Buscar remitente
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("Usuario remitente no encontrado"));

        // 2. Buscar destinatario
        User receiver = userRepository.findByUsername(request.getReceiverUsername())
                .orElseThrow(() -> new UserNotFoundException("Usuario destinatario no encontrado: " + request.getReceiverUsername()));

        // 3. Validar que no sea transferencia a sí mismo
        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("No puedes transferirte dinero a ti mismo");
        }

        // 4. Validar saldo suficiente
        if (sender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    String.format("Saldo insuficiente. Tu saldo actual: %s, Monto a transferir: %s",
                            sender.getBalance(), request.getAmount())
            );
        }

        // 5. Crear transacción con estado PENDING
        Transaction transaction = new Transaction();
        transaction.setSenderId(senderId);
        transaction.setReceiverUsername(receiver.getUsername());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setStatus("PENDING");

        Transaction savedTransaction = transactionRepository.save(transaction);

        return TransactionResponse.fromEntity(savedTransaction, sender.getUsername());
    }

    @Transactional
    public TransactionResponse confirmTransfer(Long transactionId, Long senderId) {
        // 1. Buscar transacción
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transacción no encontrada"));

        // 2. Validar que la transacción pertenezca al remitente
        if (!transaction.getSenderId().equals(senderId)) {
            throw new UnauthorizedTransactionException("No tienes permiso para confirmar esta transacción");
        }

        // 3. Validar que esté en estado PENDING
        if (!"PENDING".equals(transaction.getStatus())) {
            throw new InvalidTransactionStatusException(
                    "La transacción no puede ser confirmada. Estado actual: " + transaction.getStatus()
            );
        }

        // 4. Buscar usuarios
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("Usuario remitente no encontrado"));

        User receiver = userRepository.findByUsername(transaction.getReceiverUsername())
                .orElseThrow(() -> new UserNotFoundException("Usuario destinatario no encontrado"));

        // 5. Validar nuevamente saldo suficiente
        if (sender.getBalance().compareTo(transaction.getAmount()) < 0) {
            throw new InsufficientBalanceException(
                    String.format("Saldo insuficiente. Tu saldo actual: %s, Monto a transferir: %s",
                            sender.getBalance(), transaction.getAmount())
            );
        }

        // 6. Actualizar saldos
        sender.setBalance(sender.getBalance().subtract(transaction.getAmount()));
        receiver.setBalance(receiver.getBalance().add(transaction.getAmount()));

        // 7. Actualizar estado de la transacción
        transaction.setStatus("COMPLETED");

        // 8. Guardar cambios
        userRepository.save(sender);
        userRepository.save(receiver);
        Transaction savedTransaction = transactionRepository.save(transaction);

        return TransactionResponse.fromEntity(savedTransaction, sender.getUsername());
    }

    @Transactional
    public TransactionResponse cancelTransfer(Long transactionId, Long senderId) {
        // 1. Buscar transacción
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transacción no encontrada"));

        // 2. Validar que la transacción pertenezca al remitente
        if (!transaction.getSenderId().equals(senderId)) {
            throw new UnauthorizedTransactionException("No tienes permiso para cancelar esta transacción");
        }

        // 3. Validar que esté en estado PENDING
        if (!"PENDING".equals(transaction.getStatus())) {
            throw new InvalidTransactionStatusException(
                    "La transacción no puede ser cancelada. Estado actual: " + transaction.getStatus()
            );
        }

        // 4. Actualizar estado
        transaction.setStatus("CANCELLED");
        Transaction savedTransaction = transactionRepository.save(transaction);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("Usuario remitente no encontrado"));

        return TransactionResponse.fromEntity(savedTransaction, sender.getUsername());
    }

    public List<TransactionHistoryResponse> getTransactionHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        String username = user.getUsername();

        // Obtener transacciones enviadas
        List<Transaction> sentTransactions = transactionRepository.findBySenderIdOrderByCreatedAtDesc(userId);

        // Obtener transacciones recibidas
        List<Transaction> receivedTransactions = transactionRepository.findByReceiverUsernameOrderByCreatedAtDesc(username);

        // Combinar y convertir a DTOs
        List<TransactionHistoryResponse> sent = sentTransactions.stream()
                .map(t -> new TransactionHistoryResponse(
                        t.getId(),
                        t.getReceiverUsername(),
                        t.getAmount(),
                        t.getStatus(),
                        "SENT",
                        t.getDescription(),
                        t.getCreatedAt()
                ))
                .collect(Collectors.toList());

        List<TransactionHistoryResponse> received = receivedTransactions.stream()
                .map(t -> {
                    User sender = userRepository.findById(t.getSenderId()).orElse(null);
                    String senderUsername = sender != null ? sender.getUsername() : "Desconocido";
                    return new TransactionHistoryResponse(
                            t.getId(),
                            senderUsername,
                            t.getAmount(),
                            t.getStatus(),
                            "RECEIVED",
                            t.getDescription(),
                            t.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());

        // Combinar y ordenar por fecha descendente
        sent.addAll(received);
        return sent.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public TransactionResponse getTransactionById(Long transactionId, Long userId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transacción no encontrada"));

        // Solo el remitente puede ver los detalles completos
        if (!transaction.getSenderId().equals(userId)) {
            throw new UnauthorizedTransactionException("No tienes permiso para ver esta transacción");
        }

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Usuario remitente no encontrado"));

        return TransactionResponse.fromEntity(transaction, sender.getUsername());
    }

    // Transferencia directa (sin confirmación separada)
    @Transactional
    public TransactionResponse transferDirect(Long senderId, String receiverUsername, BigDecimal amount, String description) {
        // 1. Buscar remitente
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("Usuario remitente no encontrado"));

        // 2. Buscar destinatario
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new UserNotFoundException("Usuario destinatario no encontrado: " + receiverUsername));

        // 3. Validar que no sea transferencia a sí mismo
        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("No puedes transferirte dinero a ti mismo");
        }

        // 4. Validar saldo suficiente
        if (sender.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                    String.format("Saldo insuficiente. Tu saldo actual: %s, Monto a transferir: %s",
                            sender.getBalance(), amount)
            );
        }

        // 5. Actualizar saldos
        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        // 6. Crear transacción con estado COMPLETED
        Transaction transaction = new Transaction();
        transaction.setSenderId(senderId);
        transaction.setReceiverUsername(receiver.getUsername());
        transaction.setAmount(amount);
        transaction.setDescription(description);
        transaction.setStatus("COMPLETED");

        // 7. Guardar cambios
        userRepository.save(sender);
        userRepository.save(receiver);
        Transaction savedTransaction = transactionRepository.save(transaction);

        return TransactionResponse.fromEntity(savedTransaction, sender.getUsername());
    }
}
