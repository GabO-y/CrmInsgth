package com.uern.tep.crminsight.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.uern.tep.crminsight.model.enums.RankVendedor;

public record VendedorResponseDTO(
    UUID id,
    String nome,
    String matricula,
    LocalDate dataAdmissao,
    BigDecimal metaMensal,
    BigDecimal comissaoBase,
    RankVendedor rank
) {}
