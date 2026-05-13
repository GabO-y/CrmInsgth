package com.uern.tep.crminsight.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uern.tep.crminsight.model.entity.Vendedor;

public interface VendedorRepository extends JpaRepository<Vendedor, UUID> {
    Optional<Vendedor> findByMatricula(String matricula);
}
