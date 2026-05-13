package com.uern.tep.crminsight.model.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.uern.tep.crminsight.model.enums.RankVendedor;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Vendedor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nome;

    private String matricula;

    private LocalDate dataAdmissao;

    private BigDecimal metaMensal;

    private BigDecimal comissaoBase;

    @Enumerated(EnumType.STRING)
    private RankVendedor rank;
}
