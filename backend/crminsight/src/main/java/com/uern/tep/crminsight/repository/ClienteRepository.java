package com.uern.tep.crminsight.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.uern.tep.crminsight.model.entity.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, UUID> {
}
