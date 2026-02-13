package com.flashybank.controller;

import com.flashybank.dto.LoginRequest;
import com.flashybank.dto.LoginResponse;
import com.flashybank.dto.LogoutRequest;
import com.flashybank.dto.RefreshTokenRequest;
import com.flashybank.dto.RegisterRequest;
import com.flashybank.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @Valid @RequestBody LogoutRequest request,
            HttpServletRequest httpRequest) {

        // Extraer el token del header Authorization
        String authHeader = httpRequest.getHeader("Authorization");
        String accessToken = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        }

        // Llamar al servicio de logout con ambos tokens
        if (accessToken != null) {
            authService.logout(accessToken, request);
        } else {
            // Si no hay access token, al menos invalidar el refresh token
            authService.logout("", request);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout exitoso. Tokens invalidados.");

        return ResponseEntity.ok(response);
    }
}
