package com.uern.tep.crminsight.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.uern.tep.crminsight.model.dto.request.VendedorRequestDTO;
import com.uern.tep.crminsight.model.dto.response.VendedorResponseDTO;
import com.uern.tep.crminsight.model.entity.Vendedor;
import com.uern.tep.crminsight.repository.VendedorRepository;

@Service
public class VendedorService {

    private final VendedorRepository vendedorRepository;

    public VendedorService(VendedorRepository vendedorRepository) {
        this.vendedorRepository = vendedorRepository;
    }

    public List<VendedorResponseDTO> listarTodos() {
        return vendedorRepository.findAll().stream()
            .map(this::toResponseDTO)
            .toList();
    }

    public VendedorResponseDTO buscarPorId(UUID id) {
        return toResponseDTO(vendedorRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendedor não encontrado: " + id)));
    }

    public VendedorResponseDTO criar(VendedorRequestDTO dto) {
        if (vendedorRepository.findByMatricula(dto.matricula()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Matrícula já cadastrada: " + dto.matricula());
        }
        var vendedor = new Vendedor();
        vendedor.setNome(dto.nome());
        vendedor.setMatricula(dto.matricula());
        vendedor.setDataAdmissao(dto.dataAdmissao());
        vendedor.setMetaMensal(dto.metaMensal());
        vendedor.setComissaoBase(dto.comissaoBase());
        vendedor.setRank(dto.rank());
        vendedor = vendedorRepository.save(vendedor);
        return toResponseDTO(vendedor);
    }

    public VendedorResponseDTO atualizar(UUID id, VendedorRequestDTO dto) {
        var vendedor = vendedorRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendedor não encontrado: " + id));
        vendedor.setNome(dto.nome());
        vendedor.setMatricula(dto.matricula());
        vendedor.setDataAdmissao(dto.dataAdmissao());
        vendedor.setMetaMensal(dto.metaMensal());
        vendedor.setComissaoBase(dto.comissaoBase());
        vendedor.setRank(dto.rank());
        vendedor = vendedorRepository.save(vendedor);
        return toResponseDTO(vendedor);
    }

    public void deletar(UUID id) {
        var vendedor = vendedorRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendedor não encontrado: " + id));
        vendedorRepository.delete(vendedor);
    }

    public VendedorResponseDTO toResponseDTO(Vendedor vendedor) {
        return new VendedorResponseDTO(
            vendedor.getId(),
            vendedor.getNome(),
            vendedor.getMatricula(),
            vendedor.getDataAdmissao(),
            vendedor.getMetaMensal(),
            vendedor.getComissaoBase(),
            vendedor.getRank()
        );
    }
}
