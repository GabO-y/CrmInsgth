package com.uern.tep.crminsight.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uern.tep.crminsight.model.entity.Interacao;

public interface InteracaoRepository extends JpaRepository<Interacao, UUID> {

    List<Interacao> findByClienteId(UUID clienteId);

    List<Interacao> findByVendedorId(UUID vendedorId);
}
