package com.uern.tep.crminsight.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.uern.tep.crminsight.model.dto.response.AnaliticoResponseDTO;
import com.uern.tep.crminsight.model.enums.StatusVenda;
import com.uern.tep.crminsight.repository.InteracaoRepository;
import com.uern.tep.crminsight.repository.VendaRepository;

@Service
public class AnaliticoService {

    private final VendaRepository vendaRepository;
    private final InteracaoRepository interacaoRepository;

    public AnaliticoService(VendaRepository vendaRepository, InteracaoRepository interacaoRepository) {
        this.vendaRepository = vendaRepository;
        this.interacaoRepository = interacaoRepository;
    }

    public AnaliticoResponseDTO taxaConversao(UUID vendedorId) {
        var totalInteracoes = interacaoRepository.findByVendedorId(vendedorId).size();
        var totalVendas = vendaRepository.countByVendedorIdAndStatus(vendedorId, StatusVenda.CONCLUIDA);
        var taxa = totalInteracoes > 0
            ? BigDecimal.valueOf(totalVendas).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalInteracoes), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        return new AnaliticoResponseDTO("taxa_conversao", taxa, "%");
    }

    public AnaliticoResponseDTO ticketMedio30d(UUID clienteId) {
        var dataLimite = LocalDate.now().minusDays(30);
        var media = vendaRepository.avgValorByClienteSince(clienteId, dataLimite);
        return new AnaliticoResponseDTO("ticket_medio_30d", media, "R$");
    }

    public AnaliticoResponseDTO churnProbabilidade(UUID clienteId) {
        var ultimaCompra = vendaRepository.lastPurchaseDateByCliente(clienteId);
        if (ultimaCompra.isEmpty()) {
            return new AnaliticoResponseDTO("churn_probabilidade", BigDecimal.valueOf(80), "%");
        }
        var dias = ChronoUnit.DAYS.between(ultimaCompra.get(), LocalDate.now());
        BigDecimal probabilidade;
        if (dias > 180) probabilidade = BigDecimal.valueOf(90);
        else if (dias > 90) probabilidade = BigDecimal.valueOf(60);
        else if (dias > 30) probabilidade = BigDecimal.valueOf(30);
        else probabilidade = BigDecimal.valueOf(10);
        return new AnaliticoResponseDTO("churn_probabilidade", probabilidade, "%");
    }

    public AnaliticoResponseDTO eficienciaVendedor(UUID vendedorId) {
        var totalInteracoes = interacaoRepository.findByVendedorId(vendedorId).size();
        var totalVendas = vendaRepository.countByVendedorIdAndStatus(vendedorId, StatusVenda.CONCLUIDA);
        var eficiencia = totalInteracoes > 0
            ? BigDecimal.valueOf(totalVendas).divide(BigDecimal.valueOf(totalInteracoes), 4, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        return new AnaliticoResponseDTO("eficiencia_vendedor", eficiencia, "vendas/interacao");
    }

    public AnaliticoResponseDTO performanceMeta(UUID vendedorId) {
        var inicioMes = LocalDate.now().withDayOfMonth(1);
        var fimMes = LocalDate.now();
        var totalVendas = vendaRepository.sumValorByVendedorAndPeriod(vendedorId, inicioMes, fimMes);
        return new AnaliticoResponseDTO("performance_meta", totalVendas, "R$");
    }

    public AnaliticoResponseDTO especializacao(UUID vendedorId) {
        var total = vendaRepository.sumValorByVendedor(vendedorId);
        if (total.compareTo(BigDecimal.ZERO) == 0) {
            return new AnaliticoResponseDTO("especializacao", BigDecimal.ZERO, "nenhum");
        }
        var porSegmento = vendaRepository.sumValorByVendedorGroupBySegmento(vendedorId);
        String maiorSegmento = "";
        BigDecimal maiorValor = BigDecimal.ZERO;
        for (var row : porSegmento) {
            var valor = (BigDecimal) row[1];
            if (valor.compareTo(maiorValor) > 0) {
                maiorValor = valor;
                maiorSegmento = (String) row[0];
            }
        }
        return new AnaliticoResponseDTO("especializacao", maiorSegmento.isEmpty() ? BigDecimal.ZERO : BigDecimal.ONE, maiorSegmento);
    }
}
