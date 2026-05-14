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

import com.uern.tep.crminsight.model.dto.request.VendaRequestDTO;
import com.uern.tep.crminsight.model.dto.response.VendaResponseDTO;
import com.uern.tep.crminsight.repository.UsuarioRepository;
import com.uern.tep.crminsight.service.VendaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    private final VendaService vendaService;
    private final UsuarioRepository usuarioRepository;

    public VendaController(VendaService vendaService, UsuarioRepository usuarioRepository) {
        this.vendaService = vendaService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<List<VendaResponseDTO>> listar(
            @RequestParam(required = false) UUID clienteId,
            @RequestParam(required = false) UUID vendedorId,
            Authentication auth) {
        if (isVendedor(auth)) {
            return ResponseEntity.ok(vendaService.listarPorVendedor(vendedorLogadoId(auth)));
        }
        if (clienteId != null) return ResponseEntity.ok(vendaService.listarPorCliente(clienteId));
        if (vendedorId != null) return ResponseEntity.ok(vendaService.listarPorVendedor(vendedorId));
        return ResponseEntity.ok(vendaService.listarTodas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<VendaResponseDTO> buscar(@PathVariable UUID id, Authentication auth) {
        var venda = vendaService.buscarPorId(id);
        if (isVendedor(auth)) {
            var vendedorLogado = vendedorLogadoId(auth);
            if (!venda.vendedorId().equals(vendedorLogado)) {
                return ResponseEntity.notFound().build();
            }
        }
        return ResponseEntity.ok(venda);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<VendaResponseDTO> criar(@RequestBody @Valid VendaRequestDTO dto, Authentication auth) {
        if (isVendedor(auth)) {
            var vendedorLogado = vendedorLogadoId(auth);
            dto = new VendaRequestDTO(dto.data(), dto.valor(), dto.status(), dto.comissaoPaga(), dto.clienteId(), vendedorLogado);
        }
        var response = vendaService.criar(dto);
        return ResponseEntity.created(URI.create("/api/vendas/" + response.id())).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        vendaService.deletar(id);
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
