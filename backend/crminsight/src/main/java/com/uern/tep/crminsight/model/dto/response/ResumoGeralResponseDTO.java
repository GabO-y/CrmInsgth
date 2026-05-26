package com.uern.tep.crminsight.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.uern.tep.crminsight.model.enums.StatusVenda;

public record ResumoGeralResponseDTO(
    long totalClientes,
    long totalVendedores,
    BigDecimal faturamentoTotal,
    BigDecimal faturamentoMes,
    long totalVendasConcluidas,
    long totalInteracoes,
    long totalVendas,
    List<VendaPorMes> vendasPorMes,
    List<VendaPorVendedor> topVendedores,
    Map<String, Long> vendasPorStatus,
    List<VendaResumida> ultimasVendas,
    List<InteracaoResumida> ultimasInteracoes
) {
    public record VendaPorMes(String mes, BigDecimal valor) {}
    public record VendaPorVendedor(String nome, BigDecimal total) {}
    public record VendaResumida(UUID id, LocalDate data, String clienteNome, String vendedorNome, BigDecimal valor, StatusVenda status) {}
    public record InteracaoResumida(UUID id, LocalDateTime dataHora, String clienteNome, String canal, int duracao) {}
}
