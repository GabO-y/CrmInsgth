package com.uern.tep.crminsight.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uern.tep.crminsight.model.dto.request.InteracaoRequestDTO;
import com.uern.tep.crminsight.model.dto.response.InteracaoResponseDTO;
import com.uern.tep.crminsight.service.InteracaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/interacoes")
public class InteracaoController {

    private final InteracaoService interacaoService;

    public InteracaoController(InteracaoService interacaoService) {
        this.interacaoService = interacaoService;
    }

    @GetMapping
    public ResponseEntity<List<InteracaoResponseDTO>> listar(
            @RequestParam(required = false) UUID clienteId,
            @RequestParam(required = false) UUID vendedorId) {
        if (clienteId != null) return ResponseEntity.ok(interacaoService.listarPorCliente(clienteId));
        if (vendedorId != null) return ResponseEntity.ok(interacaoService.listarPorVendedor(vendedorId));
        return ResponseEntity.ok(interacaoService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InteracaoResponseDTO> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(interacaoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<InteracaoResponseDTO> criar(@RequestBody @Valid InteracaoRequestDTO dto) {
        var response = interacaoService.criar(dto);
        return ResponseEntity.created(URI.create("/api/interacoes/" + response.id())).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        interacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
