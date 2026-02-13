package com.flashybank.controller;

import com.flashybank.dto.UpdateProfileRequest;
import com.flashybank.dto.UserPublicResponse;
import com.flashybank.dto.UserProfileResponse;
import com.flashybank.dto.ValidateUserResponse;
import com.flashybank.exception.UserNotFoundException;
import com.flashybank.model.User;
import com.flashybank.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        UserProfileResponse response = new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getBalance(),
                user.getRole(),
                user.getEnabled(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        // Validar que el nuevo username no esté en uso por otro usuario
        if (!currentUsername.equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "El nombre de usuario ya está en uso");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
            }
        }

        // Actualizar solo el username (no balance, role, enabled)
        user.setUsername(request.getUsername());
        User updatedUser = userRepository.save(user);

        UserProfileResponse response = new UserProfileResponse(
                updatedUser.getId(),
                updatedUser.getUsername(),
                updatedUser.getBalance(),
                updatedUser.getRole(),
                updatedUser.getEnabled(),
                updatedUser.getCreatedAt(),
                updatedUser.getUpdatedAt()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate/{username}")
    public ResponseEntity<ValidateUserResponse> validateUser(
            @PathVariable String username,
            Authentication authentication) {

        String currentUsername = authentication.getName();

        // Validar que no sea el mismo usuario
        if (currentUsername.equals(username)) {
            ValidateUserResponse response = new ValidateUserResponse(
                    false,
                    username,
                    "No puedes transferirte dinero a ti mismo"
            );
            return ResponseEntity.ok(response);
        }

        // Verificar que el usuario existe
        boolean exists = userRepository.existsByUsername(username);

        if (exists) {
            ValidateUserResponse response = new ValidateUserResponse(
                    true,
                    username,
                    "Usuario válido para transferir"
            );
            return ResponseEntity.ok(response);
        } else {
            ValidateUserResponse response = new ValidateUserResponse(
                    false,
                    username,
                    "Usuario no encontrado"
            );
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserPublicResponse> getUserByUsername(
            @PathVariable String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Usuario no encontrado"));

        // Retornar solo información pública
        UserPublicResponse response = new UserPublicResponse(
                user.getUsername(),
                user.getRole(),
                user.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Authentication authentication) {

        // Crear paginación
        Pageable pageable = PageRequest.of(page, size, Sort.by("username").ascending());

        Page<User> usersPage;

        if (search != null && !search.isEmpty()) {
            // Buscar por username que contenga el search term
            usersPage = userRepository.findAllByUsernameContainingIgnoreCase(search, pageable);
        } else {
            // Listar todos
            usersPage = userRepository.findAll(pageable);
        }

        // Convertir a DTOs públicos
        List<UserPublicResponse> userResponses = usersPage.getContent().stream()
                .map(user -> new UserPublicResponse(
                        user.getUsername(),
                        user.getRole(),
                        user.getCreatedAt()
                ))
                .collect(Collectors.toList());

        // Crear response
        Map<String, Object> response = new HashMap<>();
        response.put("content", userResponses);
        response.put("currentPage", usersPage.getNumber());
        response.put("totalElements", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());
        response.put("size", usersPage.getSize());

        return ResponseEntity.ok(response);
    }
}
