package com.uern.tep.crminsight.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.uern.tep.crminsight.model.dto.response.AnaliticoResponseDTO;
import com.uern.tep.crminsight.repository.UsuarioRepository;
import com.uern.tep.crminsight.service.AnaliticoService;

@RestController
@RequestMapping("/api/analitico/meu")
@PreAuthorize("hasRole('VENDEDOR')")
public class MeuAnaliticoController {

    private final AnaliticoService analiticoService;
    private final UsuarioRepository usuarioRepository;

    public MeuAnaliticoController(AnaliticoService analiticoService, UsuarioRepository usuarioRepository) {
        this.analiticoService = analiticoService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/taxa-conversao")
    public ResponseEntity<AnaliticoResponseDTO> taxaConversao(Authentication auth) {
        return ResponseEntity.ok(analiticoService.taxaConversao(vendedorId(auth)));
    }

    @GetMapping("/eficiencia-vendedor")
    public ResponseEntity<AnaliticoResponseDTO> eficienciaVendedor(Authentication auth) {
        return ResponseEntity.ok(analiticoService.eficienciaVendedor(vendedorId(auth)));
    }

    @GetMapping("/performance-meta")
    public ResponseEntity<AnaliticoResponseDTO> performanceMeta(Authentication auth) {
        return ResponseEntity.ok(analiticoService.performanceMeta(vendedorId(auth)));
    }

    @GetMapping("/especializacao")
    public ResponseEntity<AnaliticoResponseDTO> especializacao(Authentication auth) {
        return ResponseEntity.ok(analiticoService.especializacao(vendedorId(auth)));
    }

    private UUID vendedorId(Authentication auth) {
        var usuario = usuarioRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
        if (usuario.getVendedorId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário VENDEDOR sem vendedorId vinculado");
        }
        return usuario.getVendedorId();
    }
}
