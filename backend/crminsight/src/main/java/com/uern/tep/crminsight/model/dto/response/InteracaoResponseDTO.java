package com.uern.tep.crminsight.model.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.uern.tep.crminsight.model.enums.CanalInteracao;

public record InteracaoResponseDTO(
    UUID id,
    LocalDateTime dataHora,
    CanalInteracao canal,
    int duracao,
    int avaliacao,
    UUID clienteId,
    String clienteNome,
    UUID vendedorId,
    String vendedorNome
) {}
