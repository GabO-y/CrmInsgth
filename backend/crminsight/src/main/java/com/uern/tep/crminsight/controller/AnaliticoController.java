package com.uern.tep.crminsight.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uern.tep.crminsight.model.dto.response.AnaliticoResponseDTO;
import com.uern.tep.crminsight.service.AnaliticoService;

@RestController
@RequestMapping("/api/analitico")
public class AnaliticoController {

    private final AnaliticoService analiticoService;

    public AnaliticoController(AnaliticoService analiticoService) {
        this.analiticoService = analiticoService;
    }

    @GetMapping("/taxa-conversao")
    public ResponseEntity<AnaliticoResponseDTO> taxaConversao(@RequestParam UUID vendedorId) {
        return ResponseEntity.ok(analiticoService.taxaConversao(vendedorId));
    }

    @GetMapping("/ticket-medio-30d")
    public ResponseEntity<AnaliticoResponseDTO> ticketMedio30d(@RequestParam UUID clienteId) {
        return ResponseEntity.ok(analiticoService.ticketMedio30d(clienteId));
    }

    @GetMapping("/churn")
    public ResponseEntity<AnaliticoResponseDTO> churn(@RequestParam UUID clienteId) {
        return ResponseEntity.ok(analiticoService.churnProbabilidade(clienteId));
    }

    @GetMapping("/eficiencia-vendedor")
    public ResponseEntity<AnaliticoResponseDTO> eficienciaVendedor(@RequestParam UUID vendedorId) {
        return ResponseEntity.ok(analiticoService.eficienciaVendedor(vendedorId));
    }

    @GetMapping("/performance-meta")
    public ResponseEntity<AnaliticoResponseDTO> performanceMeta(@RequestParam UUID vendedorId) {
        return ResponseEntity.ok(analiticoService.performanceMeta(vendedorId));
    }

    @GetMapping("/especializacao")
    public ResponseEntity<AnaliticoResponseDTO> especializacao(@RequestParam UUID vendedorId) {
        return ResponseEntity.ok(analiticoService.especializacao(vendedorId));
    }
}
