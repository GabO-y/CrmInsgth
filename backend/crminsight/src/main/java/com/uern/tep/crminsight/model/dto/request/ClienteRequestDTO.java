package com.uern.tep.crminsight.model.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ClienteRequestDTO(
    @NotBlank String nome,
    @NotBlank String segmento
) {}
