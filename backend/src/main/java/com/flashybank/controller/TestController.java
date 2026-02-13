package com.flashybank.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hola desde FlashyBank - API funcionando!");
        response.put("status", "online");
        return response;
    }

    @GetMapping("/protected")
    public Map<String, Object> protectedEndpoint(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Este es un endpoint protegido");
        response.put("username", authentication.getName());
        response.put("authorities", authentication.getAuthorities());
        return response;
    }
}
