package com.uern.tep.crminsight.model.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.uern.tep.crminsight.model.enums.StatusVenda;

import jakarta.validation.constraints.NotNull;

public record VendaRequestDTO(
    @NotNull LocalDate data,
    @NotNull BigDecimal valor,
    @NotNull StatusVenda status,
    @NotNull BigDecimal comissaoPaga,
    @NotNull UUID clienteId,
    @NotNull UUID vendedorId
) {}
