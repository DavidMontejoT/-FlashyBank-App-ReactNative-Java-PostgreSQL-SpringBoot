package com.flashybank.controller;

import com.flashybank.dto.InitiateTransferRequest;
import com.flashybank.dto.TransactionHistoryResponse;
import com.flashybank.dto.TransactionResponse;
import com.flashybank.model.User;
import com.flashybank.repository.UserRepository;
import com.flashybank.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transferDirect(
            Authentication authentication,
            @Valid @RequestBody InitiateTransferRequest request) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        TransactionResponse response = transactionService.transferDirect(
                user.getId(),
                request.getReceiverUsername(),
                request.getAmount(),
                request.getDescription()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/initiate")
    public ResponseEntity<TransactionResponse> initiateTransfer(
            Authentication authentication,
            @Valid @RequestBody InitiateTransferRequest request) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        TransactionResponse response = transactionService.initiateTransfer(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/confirm/{id}")
    public ResponseEntity<TransactionResponse> confirmTransfer(
            Authentication authentication,
            @PathVariable Long id) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        TransactionResponse response = transactionService.confirmTransfer(id, user.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cancel/{id}")
    public ResponseEntity<TransactionResponse> cancelTransfer(
            Authentication authentication,
            @PathVariable Long id) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        TransactionResponse response = transactionService.cancelTransfer(id, user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<TransactionHistoryResponse>> getTransactionHistory(
            Authentication authentication) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<TransactionHistoryResponse> history = transactionService.getTransactionHistory(user.getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(
            Authentication authentication,
            @PathVariable Long id) {

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        TransactionResponse response = transactionService.getTransactionById(id, user.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Map<String, Object> response = new HashMap<>();
        response.put("username", username);
        response.put("balance", user.getBalance());
        return ResponseEntity.ok(response);
    }
}
