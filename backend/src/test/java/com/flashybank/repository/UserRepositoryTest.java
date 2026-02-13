package com.flashybank.repository;

import com.flashybank.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUserByUsername() {
        // Given
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("encoded_password");
        user.setBalance(BigDecimal.valueOf(100.0));
        user.setRole("USER");
        user.setEnabled(true);

        entityManager.persist(user);
        entityManager.flush();

        // When
        Optional<User> found = userRepository.findByUsername("testuser");

        // Then
        assertTrue(found.isPresent());
        assertEquals("testuser", found.get().getUsername());
    }

    @Test
    void shouldCheckIfUsernameExists() {
        // Given
        User user = new User();
        user.setUsername("existinguser");
        user.setPassword("encoded_password");
        user.setBalance(BigDecimal.ZERO);
        user.setRole("USER");
        user.setEnabled(true);

        entityManager.persist(user);
        entityManager.flush();

        // When
        boolean exists = userRepository.existsByUsername("existinguser");
        boolean notExists = userRepository.existsByUsername("nonexistent");

        // Then
        assertTrue(exists);
        assertFalse(notExists);
    }

    @Test
    void shouldReturnEmptyWhenUsernameNotFound() {
        // When
        Optional<User> found = userRepository.findByUsername("nonexistent");

        // Then
        assertFalse(found.isPresent());
    }
}
