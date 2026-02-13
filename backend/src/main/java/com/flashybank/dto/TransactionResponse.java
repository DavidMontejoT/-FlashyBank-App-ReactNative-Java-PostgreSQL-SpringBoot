package com.flashybank.dto;

import com.flashybank.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private Long senderId;
    private String senderUsername;
    private String receiverUsername;
    private BigDecimal amount;
    private String status;
    private String description;
    private LocalDateTime createdAt;

    public static TransactionResponse fromEntity(Transaction transaction, String senderUsername) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getSenderId(),
                senderUsername,
                transaction.getReceiverUsername(),
                transaction.getAmount(),
                transaction.getStatus(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }
}
