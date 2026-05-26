package com.uern.tep.crminsight.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.uern.tep.crminsight.model.dto.response.AnaliticoResponseDTO;
import com.uern.tep.crminsight.model.dto.response.ResumoGeralResponseDTO;
import com.uern.tep.crminsight.model.dto.response.ResumoGeralResponseDTO.InteracaoResumida;
import com.uern.tep.crminsight.model.dto.response.ResumoGeralResponseDTO.VendaPorMes;
import com.uern.tep.crminsight.model.dto.response.ResumoGeralResponseDTO.VendaPorVendedor;
import com.uern.tep.crminsight.model.dto.response.ResumoGeralResponseDTO.VendaResumida;
import com.uern.tep.crminsight.model.enums.StatusVenda;
import com.uern.tep.crminsight.repository.ClienteRepository;
import com.uern.tep.crminsight.repository.InteracaoRepository;
import com.uern.tep.crminsight.repository.VendaRepository;
import com.uern.tep.crminsight.repository.VendedorRepository;

@Service
public class AnaliticoService {

    private final VendaRepository vendaRepository;
    private final InteracaoRepository interacaoRepository;
    private final VendedorRepository vendedorRepository;
    private final ClienteRepository clienteRepository;

    public AnaliticoService(VendaRepository vendaRepository, InteracaoRepository interacaoRepository, VendedorRepository vendedorRepository, ClienteRepository clienteRepository) {
        this.vendaRepository = vendaRepository;
        this.interacaoRepository = interacaoRepository;
        this.vendedorRepository = vendedorRepository;
        this.clienteRepository = clienteRepository;
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
        if (media == null) {
            return new AnaliticoResponseDTO("ticket_medio_30d", BigDecimal.ZERO, "R$");
        }
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
            ? BigDecimal.valueOf(totalVendas).multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalInteracoes), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;
        return new AnaliticoResponseDTO("eficiencia_vendedor", eficiencia, "%");
    }

    public AnaliticoResponseDTO performanceMeta(UUID vendedorId) {
        var vendedor = vendedorRepository.findById(vendedorId)
            .orElseThrow(() -> new RuntimeException("Vendedor não encontrado: " + vendedorId));
        var inicioMes = LocalDate.now().withDayOfMonth(1);
        var fimMes = LocalDate.now();
        var totalVendas = vendaRepository.sumValorByVendedorAndPeriod(vendedorId, inicioMes, fimMes);
        if (totalVendas == null || vendedor.getMetaMensal().compareTo(BigDecimal.ZERO) <= 0) {
            return new AnaliticoResponseDTO("performance_meta", BigDecimal.ZERO, "%");
        }
        var percentual = totalVendas.multiply(BigDecimal.valueOf(100))
            .divide(vendedor.getMetaMensal(), 2, RoundingMode.HALF_UP);
        return new AnaliticoResponseDTO("performance_meta", percentual, "%");
    }

    public AnaliticoResponseDTO especializacao(UUID vendedorId) {
        var total = vendaRepository.sumValorByVendedor(vendedorId);
        if (total == null || total.compareTo(BigDecimal.ZERO) == 0) {
            return new AnaliticoResponseDTO("especializacao", BigDecimal.ZERO, "nenhum");
        }
        var porSegmento = vendaRepository.sumValorByVendedorGroupBySegmento(vendedorId);
        String maiorSegmento = "";
        BigDecimal maiorValor = BigDecimal.ZERO;
        for (var row : porSegmento) {
            var valor = (BigDecimal) row[1];
            if (valor != null && valor.compareTo(maiorValor) > 0) {
                maiorValor = valor;
                maiorSegmento = (String) row[0];
            }
        }
        return new AnaliticoResponseDTO("especializacao", maiorSegmento.isEmpty() ? BigDecimal.ZERO : BigDecimal.ONE, maiorSegmento);
    }

    public ResumoGeralResponseDTO resumoGeral() {
        var totalClientes = clienteRepository.count();
        var totalVendedores = vendedorRepository.count();
        var faturamentoTotal = vendaRepository.sumValorGlobal();
        if (faturamentoTotal == null) faturamentoTotal = BigDecimal.ZERO;

        var inicioMes = LocalDate.now().withDayOfMonth(1);
        var fimMes = LocalDate.now();
        var faturamentoMes = vendaRepository.sumValorByPeriod(inicioMes, fimMes);
        if (faturamentoMes == null) faturamentoMes = BigDecimal.ZERO;

        var totalVendas = vendaRepository.count();
        var totalVendasConcluidas = 0L;
        var vendasPorStatus = new LinkedHashMap<String, Long>();
        for (var row : vendaRepository.countByStatus()) {
            var status = ((StatusVenda) row[0]).name();
            var count = (Long) row[1];
            vendasPorStatus.put(status, count);
            if (status.equals("CONCLUIDA")) totalVendasConcluidas += count;
        }

        var totalInteracoes = interacaoRepository.count();

        var vendasPorMes = new ArrayList<VendaPorMes>();
        for (var row : vendaRepository.sumValorByMonth()) {
            var ano = (Integer) row[0];
            var mes = (Integer) row[1];
            var valor = (BigDecimal) row[2];
            var key = String.format("%04d-%02d", ano, mes);
            vendasPorMes.add(new VendaPorMes(key, valor));
        }

        var topVendedores = new ArrayList<VendaPorVendedor>();
        for (var row : vendaRepository.sumValorByVendedor()) {
            var nome = (String) row[0];
            var total = (BigDecimal) row[1];
            topVendedores.add(new VendaPorVendedor(nome, total));
        }

        var ultimasVendas = new ArrayList<VendaResumida>();
        for (var v : vendaRepository.findTop5ByOrderByDataDesc()) {
            ultimasVendas.add(new VendaResumida(v.getId(), v.getData(), v.getCliente().getNome(), v.getVendedor().getNome(), v.getValor(), v.getStatus()));
        }

        var ultimasInteracoes = new ArrayList<InteracaoResumida>();
        for (var i : interacaoRepository.findTop5ByOrderByDataHoraDesc()) {
            ultimasInteracoes.add(new InteracaoResumida(i.getId(), i.getDataHora(), i.getCliente().getNome(), i.getCanal().name(), i.getDuracao()));
        }

        return new ResumoGeralResponseDTO(
            totalClientes, totalVendedores,
            faturamentoTotal, faturamentoMes,
            totalVendasConcluidas, totalInteracoes, totalVendas,
            vendasPorMes, topVendedores, vendasPorStatus,
            ultimasVendas, ultimasInteracoes
        );
    }
}
