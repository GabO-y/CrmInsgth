package com.uern.tep.crminsight.model.dto.request;

import java.util.UUID;

import com.uern.tep.crminsight.model.enums.RoleUsuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioRequestDTO(
    @NotBlank String username,
    @NotBlank String password,
    @NotNull RoleUsuario role,
    UUID vendedorId
) {}
