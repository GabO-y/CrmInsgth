package com.uern.tep.crminsight.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

import com.uern.tep.crminsight.model.entity.Venda;
import com.uern.tep.crminsight.model.enums.StatusVenda;

public interface VendaRepository extends JpaRepository<Venda, UUID> {

    List<Venda> findByClienteId(UUID clienteId);

    List<Venda> findByVendedorId(UUID vendedorId);

    List<Venda> findByClienteIdAndDataAfter(UUID clienteId, LocalDate data);

    List<Venda> findByVendedorIdAndDataBetween(UUID vendedorId, LocalDate inicio, LocalDate fim);

    int countByVendedorIdAndStatus(UUID vendedorId, StatusVenda status);

    @Query("SELECT COALESCE(SUM(v.valor), 0) FROM Venda v WHERE v.vendedor.id = :vendedorId AND v.data BETWEEN :inicio AND :fim AND v.status = 'CONCLUIDA'")
    BigDecimal sumValorByVendedorAndPeriod(@Param("vendedorId") UUID vendedorId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT COALESCE(AVG(v.valor), 0) FROM Venda v WHERE v.cliente.id = :clienteId AND v.data >= :data AND v.status = 'CONCLUIDA'")
    BigDecimal avgValorByClienteSince(@Param("clienteId") UUID clienteId, @Param("data") LocalDate data);

    @Query("SELECT COALESCE(SUM(v.valor), 0) FROM Venda v WHERE v.cliente.id = :clienteId AND v.status = 'CONCLUIDA'")
    BigDecimal sumValorByCliente(@Param("clienteId") UUID clienteId);

    @Query("SELECT COALESCE(SUM(v.valor), 0) FROM Venda v WHERE v.vendedor.id = :vendedorId AND v.status = 'CONCLUIDA'")
    BigDecimal sumValorByVendedor(@Param("vendedorId") UUID vendedorId);

    @Query("SELECT v.cliente.segmento, COALESCE(SUM(v.valor), 0) FROM Venda v WHERE v.vendedor.id = :vendedorId AND v.status = 'CONCLUIDA' GROUP BY v.cliente.segmento")
    List<Object[]> sumValorByVendedorGroupBySegmento(@Param("vendedorId") UUID vendedorId);

    @Query("SELECT MAX(v.data) FROM Venda v WHERE v.cliente.id = :clienteId AND v.status = 'CONCLUIDA'")
    Optional<LocalDate> lastPurchaseDateByCliente(@Param("clienteId") UUID clienteId);

    @Query("SELECT COUNT(v) FROM Venda v WHERE v.cliente.id = :clienteId AND v.status = 'CONCLUIDA'")
    int countConcluidasByCliente(@Param("clienteId") UUID clienteId);
}
