package com.uern.tep.crminsight.controller;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.uern.tep.crminsight.model.dto.request.VendedorRequestDTO;
import com.uern.tep.crminsight.model.dto.response.VendedorResponseDTO;
import com.uern.tep.crminsight.service.VendedorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendedores")
public class VendedorController {

    private final VendedorService vendedorService;

    public VendedorController(VendedorService vendedorService) {
        this.vendedorService = vendedorService;
    }

    @GetMapping
    public ResponseEntity<List<VendedorResponseDTO>> listar() {
        return ResponseEntity.ok(vendedorService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendedorResponseDTO> buscar(@PathVariable UUID id) {
        return ResponseEntity.ok(vendedorService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<VendedorResponseDTO> criar(@RequestBody @Valid VendedorRequestDTO dto) {
        var response = vendedorService.criar(dto);
        return ResponseEntity.created(URI.create("/api/vendedores/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendedorResponseDTO> atualizar(@PathVariable UUID id, @RequestBody @Valid VendedorRequestDTO dto) {
        return ResponseEntity.ok(vendedorService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        vendedorService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
