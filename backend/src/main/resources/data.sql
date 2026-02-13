-- Insertar usuario de prueba con password encriptado (password: 123456)
-- El hash es el resultado de BCryptPasswordEncoder.encode("123456")
INSERT INTO users (username, password, balance, role, enabled, created_at, updated_at)
VALUES ('testuser', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1000.00, 'USER', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;
