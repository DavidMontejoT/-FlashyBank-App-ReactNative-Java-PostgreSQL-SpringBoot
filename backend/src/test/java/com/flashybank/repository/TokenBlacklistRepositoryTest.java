package com.flashybank.repository;

import com.flashybank.model.TokenBlacklist;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class TokenBlacklistRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TokenBlacklistRepository tokenBlacklistRepository;

    private TokenBlacklist activeToken;
    private TokenBlacklist expiredToken;

    @BeforeEach
    void setUp() {
        // Clean up
        tokenBlacklistRepository.deleteAll();

        // Create active token (expires in the future)
        activeToken = new TokenBlacklist();
        activeToken.setToken("active_token_123");
        activeToken.setRevokedAt(LocalDateTime.now());
        activeToken.setExpiresAt(LocalDateTime.now().plusHours(1));

        // Create expired token (expired in the past)
        expiredToken = new TokenBlacklist();
        expiredToken.setToken("expired_token_456");
        expiredToken.setRevokedAt(LocalDateTime.now().minusDays(2));
        expiredToken.setExpiresAt(LocalDateTime.now().minusHours(1));
    }

    @Test
    void testSaveTokenBlacklist() {
        // When
        TokenBlacklist saved = tokenBlacklistRepository.save(activeToken);

        // Then
        assertNotNull(saved);
        assertNotNull(saved.getId());
        assertEquals("active_token_123", saved.getToken());
        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void testFindTokenInBlacklist() {
        // Given
        entityManager.persist(activeToken);
        entityManager.flush();

        // When
        Optional<TokenBlacklist> found = tokenBlacklistRepository.findByToken("active_token_123");

        // Then
        assertTrue(found.isPresent());
        assertEquals("active_token_123", found.get().getToken());
        assertNotNull(found.get().getRevokedAt());
    }

    @Test
    void testFindTokenInBlacklistNotFound() {
        // Given
        entityManager.persist(activeToken);
        entityManager.flush();

        // When
        Optional<TokenBlacklist> found = tokenBlacklistRepository.findByToken("nonexistent_token");

        // Then
        assertFalse(found.isPresent());
    }

    @Test
    void testDeleteExpiredTokens() {
        // Given
        entityManager.persist(activeToken);
        entityManager.persist(expiredToken);
        entityManager.flush();

        // When
        tokenBlacklistRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());

        // Then
        assertEquals(1, tokenBlacklistRepository.count());
        assertTrue(tokenBlacklistRepository.findByToken("active_token_123").isPresent());
        assertFalse(tokenBlacklistRepository.findByToken("expired_token_456").isPresent());
    }

    @Test
    void testFindActiveTokens() {
        // Given
        entityManager.persist(activeToken);
        entityManager.persist(expiredToken);
        entityManager.flush();

        // When
        Optional<TokenBlacklist> foundActive = tokenBlacklistRepository.findByToken("active_token_123");

        // Then
        assertTrue(foundActive.isPresent());
        assertTrue(foundActive.get().getExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Test
    void testFindExpiredTokens() {
        // Given
        entityManager.persist(activeToken);
        entityManager.persist(expiredToken);
        entityManager.flush();

        // When
        Optional<TokenBlacklist> foundExpired = tokenBlacklistRepository.findByToken("expired_token_456");

        // Then
        assertTrue(foundExpired.isPresent());
        assertTrue(foundExpired.get().getExpiresAt().isBefore(LocalDateTime.now()));
    }

    @Test
    void testMultipleTokensWithSameExpiration() {
        // Given
        TokenBlacklist token1 = new TokenBlacklist();
        token1.setToken("token1");
        token1.setRevokedAt(LocalDateTime.now());
        token1.setExpiresAt(LocalDateTime.now().plusHours(1));

        TokenBlacklist token2 = new TokenBlacklist();
        token2.setToken("token2");
        token2.setRevokedAt(LocalDateTime.now());
        token2.setExpiresAt(LocalDateTime.now().plusHours(1));

        entityManager.persist(token1);
        entityManager.persist(token2);
        entityManager.flush();

        // When
        long count = tokenBlacklistRepository.count();

        // Then
        assertEquals(2, count);
    }
}
