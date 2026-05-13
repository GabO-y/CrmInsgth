package com.uern.tep.crminsight.model.dto.response;

import java.math.BigDecimal;

public record AnaliticoResponseDTO(
    String metrica,
    BigDecimal valor,
    String unidade
) {}
