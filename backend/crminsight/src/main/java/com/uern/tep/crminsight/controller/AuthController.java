package com.uern.tep.crminsight.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.uern.tep.crminsight.model.dto.request.LoginRequestDTO;
import com.uern.tep.crminsight.model.dto.response.LoginResponseDTO;
import com.uern.tep.crminsight.model.dto.response.UsuarioResponseDTO;
import com.uern.tep.crminsight.service.JwtService;
import com.uern.tep.crminsight.service.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UsuarioService usuarioService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.usuarioService = usuarioService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO dto) {
        var usuario = usuarioService.buscarPorUsername(dto.username());

        if (!passwordEncoder.matches(dto.password(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        var token = jwtService.gerarToken(usuario);
        var usuarioDTO = new UsuarioResponseDTO(
            usuario.getId(),
            usuario.getUsername(),
            usuario.getRole(),
            usuario.getVendedorId()
        );

        return ResponseEntity.ok(new LoginResponseDTO(token, usuarioDTO));
    }
}
