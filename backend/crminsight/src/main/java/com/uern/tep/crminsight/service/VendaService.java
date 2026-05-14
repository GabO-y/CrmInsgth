package com.uern.tep.crminsight.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.uern.tep.crminsight.model.dto.request.VendaRequestDTO;
import com.uern.tep.crminsight.model.dto.response.VendaResponseDTO;
import com.uern.tep.crminsight.model.entity.Venda;
import com.uern.tep.crminsight.repository.ClienteRepository;
import com.uern.tep.crminsight.repository.VendaRepository;
import com.uern.tep.crminsight.repository.VendedorRepository;

@Service
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ClienteRepository clienteRepository;
    private final VendedorRepository vendedorRepository;
    private final ClienteService clienteService;

    public VendaService(VendaRepository vendaRepository,
                        ClienteRepository clienteRepository,
                        VendedorRepository vendedorRepository,
                        ClienteService clienteService) {
        this.vendaRepository = vendaRepository;
        this.clienteRepository = clienteRepository;
        this.vendedorRepository = vendedorRepository;
        this.clienteService = clienteService;
    }

    public List<VendaResponseDTO> listarTodas() {
        return vendaRepository.findAll().stream()
            .map(this::toResponseDTO)
            .toList();
    }

    public VendaResponseDTO buscarPorId(UUID id) {
        return toResponseDTO(vendaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venda não encontrada: " + id)));
    }

    public List<VendaResponseDTO> listarPorCliente(UUID clienteId) {
        return vendaRepository.findByClienteId(clienteId).stream()
            .map(this::toResponseDTO)
            .toList();
    }

    public List<VendaResponseDTO> listarPorVendedor(UUID vendedorId) {
        return vendaRepository.findByVendedorId(vendedorId).stream()
            .map(this::toResponseDTO)
            .toList();
    }

    @Transactional
    public VendaResponseDTO criar(VendaRequestDTO dto) {
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

        var venda = new Venda();
        venda.setData(dto.data());
        venda.setValor(dto.valor());
        venda.setStatus(dto.status());
        venda.setComissaoPaga(dto.comissaoPaga());
        venda.setCliente(cliente);
        venda.setVendedor(vendedor);
        venda = vendaRepository.save(venda);

        clienteService.recalcularScore(cliente.getId());

        return toResponseDTO(venda);
    }

    public void deletar(UUID id) {
        var venda = vendaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venda não encontrada: " + id));
        vendaRepository.delete(venda);
    }

    private VendaResponseDTO toResponseDTO(Venda venda) {
        return new VendaResponseDTO(
            venda.getId(),
            venda.getData(),
            venda.getValor(),
            venda.getStatus(),
            venda.getComissaoPaga(),
            venda.getCliente().getId(),
            venda.getCliente().getNome(),
            venda.getVendedor().getId(),
            venda.getVendedor().getNome()
        );
    }
}
