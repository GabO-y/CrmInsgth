package com.uern.tep.crminsight.model.dto.response;

public record LoginResponseDTO(
    String token,
    UsuarioResponseDTO usuario
) {}
