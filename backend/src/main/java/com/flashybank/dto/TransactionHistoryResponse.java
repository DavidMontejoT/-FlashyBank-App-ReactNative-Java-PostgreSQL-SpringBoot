package com.flashybank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionHistoryResponse {

    private Long id;
    private String otherUser;
    private BigDecimal amount;
    private String status;
    private String type; // SENT or RECEIVED
    private String description;
    private LocalDateTime createdAt;
}
