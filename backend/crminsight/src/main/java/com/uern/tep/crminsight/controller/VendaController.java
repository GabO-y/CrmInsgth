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

import com.uern.tep.crminsight.model.dto.request.VendaRequestDTO;
import com.uern.tep.crminsight.model.dto.response.VendaResponseDTO;
import com.uern.tep.crminsight.service.VendaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    private final VendaService vendaService;

    public VendaController(VendaService vendaService) {
        this.vendaService = vendaService;
    }

    @GetMapping
    public ResponseEntity<List<VendaResponseDTO>> listar(
            @RequestParam(required = false) UUID clienteId,
            @RequestParam(required = false) UUID vendedorId) {
        if (clienteId != null) return ResponseEntity.ok(vendaService.listarPorCliente(clienteId));
        if (vendedorId != null) return ResponseEntity.ok(vendaService.listarPorVendedor(vendedorId));
        return ResponseEntity.ok(vendaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendaResponseDTO> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(vendaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<VendaResponseDTO> criar(@RequestBody @Valid VendaRequestDTO dto) {
        var response = vendaService.criar(dto);
        return ResponseEntity.created(URI.create("/api/vendas/" + response.id())).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        vendaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
