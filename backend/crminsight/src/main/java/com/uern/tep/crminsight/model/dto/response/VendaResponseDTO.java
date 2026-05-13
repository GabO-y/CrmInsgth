package com.uern.tep.crminsight.model.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.uern.tep.crminsight.model.enums.StatusVenda;

public record VendaResponseDTO(
    UUID id,
    LocalDate data,
    BigDecimal valor,
    StatusVenda status,
    BigDecimal comissaoPaga,
    UUID clienteId,
    String clienteNome,
    UUID vendedorId,
    String vendedorNome
) {}
