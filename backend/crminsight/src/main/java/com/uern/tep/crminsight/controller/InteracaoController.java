package com.uern.tep.crminsight.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.uern.tep.crminsight.model.dto.request.InteracaoRequestDTO;
import com.uern.tep.crminsight.model.dto.response.InteracaoResponseDTO;
import com.uern.tep.crminsight.repository.UsuarioRepository;
import com.uern.tep.crminsight.service.InteracaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/interacoes")
public class InteracaoController {

    private final InteracaoService interacaoService;
    private final UsuarioRepository usuarioRepository;

    public InteracaoController(InteracaoService interacaoService, UsuarioRepository usuarioRepository) {
        this.interacaoService = interacaoService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<List<InteracaoResponseDTO>> listar(
            @RequestParam(required = false) UUID clienteId,
            @RequestParam(required = false) UUID vendedorId,
            Authentication auth) {
        if (isVendedor(auth)) {
            return ResponseEntity.ok(interacaoService.listarPorVendedor(vendedorLogadoId(auth)));
        }
        if (clienteId != null) return ResponseEntity.ok(interacaoService.listarPorCliente(clienteId));
        if (vendedorId != null) return ResponseEntity.ok(interacaoService.listarPorVendedor(vendedorId));
        return ResponseEntity.ok(interacaoService.listarTodas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<InteracaoResponseDTO> buscar(@PathVariable UUID id, Authentication auth) {
        var interacao = interacaoService.buscarPorId(id);
        if (isVendedor(auth)) {
            var vendedorLogado = vendedorLogadoId(auth);
            if (!interacao.vendedorId().equals(vendedorLogado)) {
                return ResponseEntity.notFound().build();
            }
        }
        return ResponseEntity.ok(interacao);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<InteracaoResponseDTO> criar(@RequestBody @Valid InteracaoRequestDTO dto, Authentication auth) {
        if (isVendedor(auth)) {
            var vendedorLogado = vendedorLogadoId(auth);
            dto = new InteracaoRequestDTO(dto.dataHora(), dto.canal(), dto.duracao(), dto.avaliacao(), dto.clienteId(), vendedorLogado);
        }
        var response = interacaoService.criar(dto);
        return ResponseEntity.created(URI.create("/api/interacoes/" + response.id())).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        interacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isVendedor(Authentication auth) {
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_VENDEDOR"));
    }

    private UUID vendedorLogadoId(Authentication auth) {
        var usuario = usuarioRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));
        if (usuario.getVendedorId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário VENDEDOR sem vendedorId vinculado");
        }
        return usuario.getVendedorId();
    }
}
