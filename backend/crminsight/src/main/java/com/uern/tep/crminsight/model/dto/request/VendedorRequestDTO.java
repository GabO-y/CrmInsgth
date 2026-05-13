package com.uern.tep.crminsight.model.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.uern.tep.crminsight.model.enums.RankVendedor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VendedorRequestDTO(
    @NotBlank String nome,
    @NotBlank String matricula,
    @NotNull LocalDate dataAdmissao,
    @NotNull BigDecimal metaMensal,
    @NotNull BigDecimal comissaoBase,
    @NotNull RankVendedor rank
) {}
