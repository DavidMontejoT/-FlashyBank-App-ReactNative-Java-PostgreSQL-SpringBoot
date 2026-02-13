package com.flashybank.service;

import com.flashybank.dto.LoginRequest;
import com.flashybank.dto.LoginResponse;
import com.flashybank.dto.LogoutRequest;
import com.flashybank.dto.RefreshTokenRequest;
import com.flashybank.dto.RegisterRequest;
import com.flashybank.model.TokenBlacklist;
import com.flashybank.model.User;
import com.flashybank.repository.TokenBlacklistRepository;
import com.flashybank.repository.UserRepository;
import com.flashybank.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return new LoginResponse(accessToken, refreshToken, user.getUsername(), user.getRole());
    }

    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El username ya está en uso");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setBalance(new java.math.BigDecimal("1000.00"));
        user.setRole("USER");
        user.setEnabled(true);

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return new LoginResponse(accessToken, refreshToken, user.getUsername(), user.getRole());
    }

    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String username = jwtUtil.extractUsername(request.getRefreshToken());
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (jwtUtil.isTokenValid(request.getRefreshToken(), userDetails)) {
            String accessToken = jwtUtil.generateToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            return new LoginResponse(accessToken, refreshToken, user.getUsername(), user.getRole());
        } else {
            throw new RuntimeException("Refresh token inválido");
        }
    }

    public void logout(String accessToken, LogoutRequest request) {
        // Extraer fecha de expiración del access token
        Date expirationDate = jwtUtil.extractExpiration(accessToken);
        LocalDateTime expiresAt = LocalDateTime.ofInstant(
                expirationDate.toInstant(),
                java.time.ZoneId.systemDefault()
        );

        // Crear entrada en blacklist para el access token
        TokenBlacklist accessBlacklist = new TokenBlacklist();
        accessBlacklist.setToken(accessToken);
        accessBlacklist.setRevokedAt(LocalDateTime.now());
        accessBlacklist.setExpiresAt(expiresAt);
        tokenBlacklistRepository.save(accessBlacklist);

        // También invalidar el refresh token
        String username = jwtUtil.extractUsername(request.getRefreshToken());
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (jwtUtil.isTokenValid(request.getRefreshToken(), userDetails)) {
            Date refreshExpiration = jwtUtil.extractExpiration(request.getRefreshToken());
            LocalDateTime refreshExpiresAt = LocalDateTime.ofInstant(
                    refreshExpiration.toInstant(),
                    java.time.ZoneId.systemDefault()
            );

            TokenBlacklist refreshBlacklist = new TokenBlacklist();
            refreshBlacklist.setToken(request.getRefreshToken());
            refreshBlacklist.setRevokedAt(LocalDateTime.now());
            refreshBlacklist.setExpiresAt(refreshExpiresAt);
            tokenBlacklistRepository.save(refreshBlacklist);
        }
    }
}
