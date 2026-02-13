package com.flashybank.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPublicResponse {

    private String username;
    private String role;
    private LocalDateTime createdAt;
}
