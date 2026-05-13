package com.uern.tep.crminsight.model.dto.request;

import java.time.LocalDateTime;
import java.util.UUID;

import com.uern.tep.crminsight.model.enums.CanalInteracao;

import jakarta.validation.constraints.NotNull;

public record InteracaoRequestDTO(
    @NotNull LocalDateTime dataHora,
    @NotNull CanalInteracao canal,
    int duracao,
    int avaliacao,
    @NotNull UUID clienteId,
    @NotNull UUID vendedorId
) {}
