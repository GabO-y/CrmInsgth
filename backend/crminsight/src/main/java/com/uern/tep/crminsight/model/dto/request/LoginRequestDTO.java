package com.uern.tep.crminsight.model.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
    @NotBlank String username,
    @NotBlank String password
) {}
