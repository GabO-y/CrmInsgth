package com.uern.tep.crminsight.model.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record ClienteResponseDTO(
    UUID id,
    String nome,
    String segmento,
    LocalDate dataEntrada,
    int score
) {}
