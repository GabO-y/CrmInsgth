package com.uern.tep.crminsight.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;

import com.uern.tep.crminsight.model.entity.Cliente;
import com.uern.tep.crminsight.repository.VendaRepository;

@Service
public class ScoreService {

    private final VendaRepository vendaRepository;

    public ScoreService(VendaRepository vendaRepository) {
        this.vendaRepository = vendaRepository;
    }

    public int calcular(Cliente cliente) {
        var totalVendas = vendaRepository.sumValorByCliente(cliente.getId());
        var totalCompras = vendaRepository.countConcluidasByCliente(cliente.getId());
        var ultimaCompra = vendaRepository.lastPurchaseDateByCliente(cliente.getId());

        int recenciaScore = 30;
        if (ultimaCompra.isPresent()) {
            long diasDesdeUltima = ChronoUnit.DAYS.between(ultimaCompra.get(), LocalDate.now());
            if (diasDesdeUltima <= 30) recenciaScore = 30;
            else if (diasDesdeUltima <= 90) recenciaScore = 20;
            else if (diasDesdeUltima <= 180) recenciaScore = 10;
            else recenciaScore = 0;
        }

        int frequenciaScore = Math.min(totalCompras * 10, 30);

        int ticketScore = 0;
        if (totalVendas.compareTo(BigDecimal.ZERO) > 0 && totalCompras > 0) {
            var ticketMedio = totalVendas.divide(BigDecimal.valueOf(totalCompras), RoundingMode.HALF_UP);
            if (ticketMedio.compareTo(new BigDecimal("10000")) >= 0) ticketScore = 40;
            else if (ticketMedio.compareTo(new BigDecimal("5000")) >= 0) ticketScore = 30;
            else if (ticketMedio.compareTo(new BigDecimal("1000")) >= 0) ticketScore = 20;
            else ticketScore = 10;
        }

        return Math.min(recenciaScore + frequenciaScore + ticketScore, 100);
    }
}
