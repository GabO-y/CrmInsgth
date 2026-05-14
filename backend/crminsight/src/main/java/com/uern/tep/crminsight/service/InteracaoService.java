package com.uern.tep.crminsight.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.uern.tep.crminsight.model.dto.request.InteracaoRequestDTO;
import com.uern.tep.crminsight.model.dto.response.InteracaoResponseDTO;
import com.uern.tep.crminsight.model.entity.Interacao;
import com.uern.tep.crminsight.repository.ClienteRepository;
import com.uern.tep.crminsight.repository.InteracaoRepository;
import com.uern.tep.crminsight.repository.VendedorRepository;

@Service
public class InteracaoService {

    private final InteracaoRepository interacaoRepository;
    private final ClienteRepository clienteRepository;
    private final VendedorRepository vendedorRepository;
    private final ClienteService clienteService;

    public InteracaoService(InteracaoRepository interacaoRepository,
                            ClienteRepository clienteRepository,
                            VendedorRepository vendedorRepository,
                            ClienteService clienteService) {
        this.interacaoRepository = interacaoRepository;
        this.clienteRepository = clienteRepository;
        this.vendedorRepository = vendedorRepository;
        this.clienteService = clienteService;
    }

    public List<InteracaoResponseDTO> listarTodas() {
        return interacaoRepository.findAll().stream()
            .map(this::toResponseDTO)
            .toList();
    }

    public InteracaoResponseDTO buscarPorId(UUID id) {
        return toResponseDTO(interacaoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interação não encontrada: " + id)));
    }

    public List<InteracaoResponseDTO> listarPorCliente(UUID clienteId) {
        return interacaoRepository.findByClienteId(clienteId).stream()
            .map(this::toResponseDTO)
            .toList();
    }

    public List<InteracaoResponseDTO> listarPorVendedor(UUID vendedorId) {
        return interacaoRepository.findByVendedorId(vendedorId).stream()
            .map(this::toResponseDTO)
            .toList();
    }

    @Transactional
    public InteracaoResponseDTO criar(InteracaoRequestDTO dto) {
        if (dto.clienteId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clienteId é obrigatório");
        }
        if (dto.vendedorId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "vendedorId é obrigatório");
        }
        var cliente = clienteRepository.findById(dto.clienteId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado: " + dto.clienteId()));
        var vendedor = vendedorRepository.findById(dto.vendedorId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendedor não encontrado: " + dto.vendedorId()));

        var interacao = new Interacao();
        interacao.setDataHora(dto.dataHora());
        interacao.setCanal(dto.canal());
        interacao.setDuracao(dto.duracao());
        interacao.setAvaliacao(dto.avaliacao());
        interacao.setCliente(cliente);
        interacao.setVendedor(vendedor);
        interacao = interacaoRepository.save(interacao);

        clienteService.recalcularScore(cliente.getId());

        return toResponseDTO(interacao);
    }

    public void deletar(UUID id) {
        var interacao = interacaoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Interação não encontrada: " + id));
        interacaoRepository.delete(interacao);
    }

    public InteracaoResponseDTO toResponseDTO(Interacao interacao) {
        return new InteracaoResponseDTO(
            interacao.getId(),
            interacao.getDataHora(),
            interacao.getCanal(),
            interacao.getDuracao(),
            interacao.getAvaliacao(),
            interacao.getCliente().getId(),
            interacao.getCliente().getNome(),
            interacao.getVendedor().getId(),
            interacao.getVendedor().getNome()
        );
    }
}
