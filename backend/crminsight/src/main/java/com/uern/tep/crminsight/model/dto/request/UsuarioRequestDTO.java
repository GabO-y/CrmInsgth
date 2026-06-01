package com.uern.tep.crminsight.model.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.uern.tep.crminsight.model.enums.RankVendedor;
import com.uern.tep.crminsight.model.enums.RoleUsuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioRequestDTO(
    @NotBlank String username,
    @NotBlank String password,
    @NotNull RoleUsuario role,
    String nome,
    String matricula,
    LocalDate dataAdmissao,
    BigDecimal metaMensal,
    BigDecimal comissaoBase,
    RankVendedor rank,
    String segmento
) {}
