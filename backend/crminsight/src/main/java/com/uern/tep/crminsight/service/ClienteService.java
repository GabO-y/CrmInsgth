package com.uern.tep.crminsight.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.uern.tep.crminsight.model.dto.request.ClienteRequestDTO;
import com.uern.tep.crminsight.model.dto.response.ClienteResponseDTO;
import com.uern.tep.crminsight.model.entity.Cliente;
import com.uern.tep.crminsight.repository.ClienteRepository;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ScoreService scoreService;

    public ClienteService(ClienteRepository clienteRepository, ScoreService scoreService) {
        this.clienteRepository = clienteRepository;
        this.scoreService = scoreService;
    }

    public List<ClienteResponseDTO> listarTodos() {
        return clienteRepository.findAll().stream()
            .map(this::toResponseDTO)
            .toList();
    }

    public ClienteResponseDTO buscarPorId(UUID id) {
        return toResponseDTO(clienteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado: " + id)));
    }

    public ClienteResponseDTO criar(ClienteRequestDTO dto) {
        var cliente = new Cliente();
        cliente.setNome(dto.nome());
        cliente.setSegmento(dto.segmento());
        cliente.setDataEntrada(LocalDate.now());
        cliente.setScore(50);
        cliente = clienteRepository.save(cliente);
        return toResponseDTO(cliente);
    }

    public ClienteResponseDTO atualizar(UUID id, ClienteRequestDTO dto) {
        var cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado: " + id));
        cliente.setNome(dto.nome());
        cliente.setSegmento(dto.segmento());
        cliente = clienteRepository.save(cliente);
        return toResponseDTO(cliente);
    }

    public void deletar(UUID id) {
        var cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado: " + id));
        clienteRepository.delete(cliente);
    }

    public void recalcularScore(UUID id) {
        var cliente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado: " + id));
        int novoScore = scoreService.calcular(cliente);
        cliente.setScore(novoScore);
        clienteRepository.save(cliente);
    }

    public ClienteResponseDTO toResponseDTO(Cliente cliente) {
        return new ClienteResponseDTO(
            cliente.getId(),
            cliente.getNome(),
            cliente.getSegmento(),
            cliente.getDataEntrada(),
            cliente.getScore()
        );
    }
}
