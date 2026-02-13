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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private TokenBlacklistRepository tokenBlacklistRepository;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private UserDetails userDetails;
    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;
    private RefreshTokenRequest refreshTokenRequest;
    private LogoutRequest logoutRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("encoded_password");
        testUser.setBalance(new BigDecimal("1000.00"));
        testUser.setRole("USER");
        testUser.setEnabled(true);

        userDetails = org.springframework.security.core.userdetails.User
                .withUsername("testuser")
                .password("encoded_password")
                .authorities("ROLE_USER")
                .build();

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("newuser");
        registerRequest.setPassword("password123");

        refreshTokenRequest = new RefreshTokenRequest();
        refreshTokenRequest.setRefreshToken("valid_refresh_token");

        logoutRequest = new LogoutRequest();
        logoutRequest.setRefreshToken("valid_refresh_token");
    }

    @Test
    void testLoginSuccess() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("access_token");
        when(jwtUtil.generateRefreshToken(userDetails)).thenReturn("refresh_token");
        // Authenticate doesn't return anything, it just throws if invalid
        doAnswer(invocation -> null).when(authenticationManager).authenticate(any());

        // When
        LoginResponse response = authService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        assertEquals("refresh_token", response.getRefreshToken());
        assertEquals("testuser", response.getUsername());
        assertEquals("USER", response.getRole());

        verify(authenticationManager, times(1)).authenticate(any());
        verify(userDetailsService, times(1)).loadUserByUsername("testuser");
        verify(jwtUtil, times(1)).generateToken(userDetails);
        verify(jwtUtil, times(1)).generateRefreshToken(userDetails);
    }

    @Test
    void testLoginInvalidPassword() {
        // Given
        doThrow(new org.springframework.security.authentication.BadCredentialsException("Invalid credentials"))
                .when(authenticationManager).authenticate(any());

        // When & Then
        assertThrows(org.springframework.security.authentication.BadCredentialsException.class,
                () -> authService.login(loginRequest));

        verify(authenticationManager, times(1)).authenticate(any());
        verify(userDetailsService, never()).loadUserByUsername(anyString());
    }

    @Test
    void testLoginUserNotFound() {
        // Given
        doThrow(new org.springframework.security.authentication.BadCredentialsException("User not found"))
                .when(authenticationManager).authenticate(any());

        LoginRequest request = new LoginRequest();
        request.setUsername("nonexistent");
        request.setPassword("password");

        // When & Then
        assertThrows(org.springframework.security.authentication.BadCredentialsException.class,
                () -> authService.login(request));

        verify(authenticationManager, times(1)).authenticate(any());
    }

    @Test
    void testRegisterSuccess() {
        // Given
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userDetailsService.loadUserByUsername("newuser")).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("access_token");
        when(jwtUtil.generateRefreshToken(userDetails)).thenReturn("refresh_token");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(2L);
            return user;
        });

        // When
        LoginResponse response = authService.register(registerRequest);

        // Then
        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        assertEquals("refresh_token", response.getRefreshToken());

        verify(userRepository, times(1)).existsByUsername("newuser");
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
        verify(jwtUtil, times(1)).generateToken(userDetails);
        verify(jwtUtil, times(1)).generateRefreshToken(userDetails);
    }

    @Test
    void testRegisterUsernameExists() {
        // Given
        when(userRepository.existsByUsername("existinguser")).thenReturn(true);
        registerRequest.setUsername("existinguser");

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.register(registerRequest));

        assertTrue(exception.getMessage().contains("ya está en uso"));
        verify(userRepository, times(1)).existsByUsername("existinguser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRefreshTokenSuccess() {
        // Given
        when(jwtUtil.extractUsername("valid_refresh_token")).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtUtil.isTokenValid("valid_refresh_token", userDetails)).thenReturn(true);
        when(jwtUtil.generateToken(userDetails)).thenReturn("new_access_token");
        when(jwtUtil.generateRefreshToken(userDetails)).thenReturn("new_refresh_token");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // When
        LoginResponse response = authService.refreshToken(refreshTokenRequest);

        // Then
        assertNotNull(response);
        assertEquals("new_access_token", response.getAccessToken());
        assertEquals("new_refresh_token", response.getRefreshToken());
        assertEquals("testuser", response.getUsername());

        verify(jwtUtil, times(1)).extractUsername("valid_refresh_token");
        verify(jwtUtil, times(1)).isTokenValid("valid_refresh_token", userDetails);
        verify(jwtUtil, times(1)).generateToken(userDetails);
        verify(jwtUtil, times(1)).generateRefreshToken(userDetails);
    }

    @Test
    void testRefreshTokenInvalid() {
        // Given
        when(jwtUtil.extractUsername("invalid_token")).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtUtil.isTokenValid("invalid_token", userDetails)).thenReturn(false);

        refreshTokenRequest.setRefreshToken("invalid_token");

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.refreshToken(refreshTokenRequest));

        assertTrue(exception.getMessage().contains("inválido"));
        verify(jwtUtil, times(1)).isTokenValid("invalid_token", userDetails);
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    void testLogoutSuccess() {
        // Given
        String accessToken = "access_token";
        when(jwtUtil.extractUsername("valid_refresh_token")).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(jwtUtil.extractExpiration(accessToken)).thenReturn(new java.util.Date(System.currentTimeMillis() + 3600000));
        when(jwtUtil.extractExpiration("valid_refresh_token")).thenReturn(new java.util.Date(System.currentTimeMillis() + 604800000));
        when(jwtUtil.isTokenValid("valid_refresh_token", userDetails)).thenReturn(true);
        when(tokenBlacklistRepository.save(any(TokenBlacklist.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        authService.logout(accessToken, logoutRequest);

        // Then
        verify(tokenBlacklistRepository, times(2)).save(any(TokenBlacklist.class));
        verify(jwtUtil, times(2)).extractExpiration(anyString());
    }

    @Test
    void testLogoutInvalidRefreshToken() {
        // Given
        String accessToken = "access_token";
        when(jwtUtil.extractUsername("invalid_token")).thenReturn("testuser");
        when(jwtUtil.extractExpiration(accessToken)).thenReturn(new java.util.Date(System.currentTimeMillis() + 3600000));
        when(jwtUtil.extractExpiration("invalid_token")).thenReturn(new java.util.Date(System.currentTimeMillis() + 604800000));
        when(tokenBlacklistRepository.save(any(TokenBlacklist.class))).thenAnswer(invocation -> {
            TokenBlacklist tb = invocation.getArgument(0);
            tb.setId(1L);
            return tb;
        });
        lenient().when(jwtUtil.isTokenValid("invalid_token", any())).thenReturn(false);

        logoutRequest.setRefreshToken("invalid_token");

        // When
        authService.logout(accessToken, logoutRequest);

        // Then
        verify(tokenBlacklistRepository, times(1)).save(any(TokenBlacklist.class));
    }
}
