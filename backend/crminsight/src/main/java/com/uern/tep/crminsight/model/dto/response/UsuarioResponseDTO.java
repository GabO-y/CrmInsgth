package com.uern.tep.crminsight.model.dto.response;

import java.util.UUID;

import com.uern.tep.crminsight.model.enums.RoleUsuario;

public record UsuarioResponseDTO(
    UUID id,
    String username,
    RoleUsuario role,
    UUID vendedorId
) {}
