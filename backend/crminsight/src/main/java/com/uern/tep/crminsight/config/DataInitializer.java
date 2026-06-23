package com.uern.tep.crminsight.config;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.uern.tep.crminsight.model.entity.Cliente;
import com.uern.tep.crminsight.model.entity.Interacao;
import com.uern.tep.crminsight.model.entity.Usuario;
import com.uern.tep.crminsight.model.entity.Venda;
import com.uern.tep.crminsight.model.entity.Vendedor;
import com.uern.tep.crminsight.model.enums.CanalInteracao;
import com.uern.tep.crminsight.model.enums.RankVendedor;
import com.uern.tep.crminsight.model.enums.RoleUsuario;
import com.uern.tep.crminsight.model.enums.StatusVenda;
import com.uern.tep.crminsight.repository.ClienteRepository;
import com.uern.tep.crminsight.repository.InteracaoRepository;
import com.uern.tep.crminsight.repository.UsuarioRepository;
import com.uern.tep.crminsight.repository.VendaRepository;
import com.uern.tep.crminsight.repository.VendedorRepository;
import com.uern.tep.crminsight.service.ScoreService;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final int QTD_VENDEDORES = 8;
    private static final int QTD_CLIENTES = 25;
    private static final int QTD_VENDAS = 55;
    private static final int QTD_INTERACOES = 82;
    private static final int QTD_CLIENTES_CHURN = 5;

    private static final List<String> NOMES = List.of(
        "Carlos", "Ana", "Roberto", "Maria", "Patrícia",
        "João", "Luciana", "Lucas", "Pedro", "Juliana",
        "Rafael", "Camila", "Felipe", "Beatriz", "André"
    );

    private static final List<String> SOBRENOMES = List.of(
        "Silva", "Santos", "Lima", "Costa", "Oliveira",
        "Souza", "Rocha", "Mendes", "Fernandes", "Almeida",
        "Barbosa", "Cardoso", "Gomes", "Ribeiro", "Carvalho"
    );

    private static final List<String> PREFIXOS_EMPRESA = List.of(
        "Tech", "Super", "Mega", "Top", "Plus",
        "Ultra", "Nova", "Prime", "Master", "Global",
        "Digital", "Express", "Bom", "Alfa", "Sigma"
    );

    private static final List<String> SUFIXOS_EMPRESA = List.of(
        "Solutions", "Varejo", "Serviços", "Consultoria", "Comércio",
        "Indústria", "Tecnologia", "Logística", "Distribuidora", "Saúde",
        "Educação", "Construção", "Transportes", "Store", "Center"
    );

    private static final List<String> SEGMENTOS = List.of(
        "Tecnologia", "Saúde", "Indústria", "Varejo", "Serviços",
        "Educação", "Alimentação", "Logística", "Construção", "Financeiro"
    );

    private static final List<String> PRODUTOS = List.of(
        "Notebook", "Desktop", "Servidor", "Monitor", "Impressora",
        "Roteador", "Switch", "Firewall", "Câmera IP", "HD Externo",
        "SSD", "Memória RAM", "Licença Microsoft 365", "Certificado Digital",
        "Software de Gestão", "Suporte Técnico", "Consultoria em TI",
        "Headset", "Webcam", "Teclado Mecânico", "Mouse Gamer",
        "Tablet", "Smartphone Corporativo", "Cadeira Ergonômica",
        "Mesa Digitalizadora", "Projetor", "Nobreak", "Estabilizador",
        "Cabo de Rede", "Patch Panel"
    );

    private static final List<String> DESCRICOES = List.of(
        "Modelo empresarial, 16GB RAM, SSD 512GB",
        "Configuração avançada para servidores corporativos",
        "Kit com mouse e teclado sem fio inclusos",
        "Alta durabilidade, garantia de 3 anos",
        "Suporte a 4 dispositivos simultâneos",
        "Licenciamento anual renovável",
        "Instalação e configuração inclusas",
        "Treinamento da equipe incluso no valor",
        "Versão premium com suporte prioritário",
        "Garantia estendida de 12 meses",
        "Entrega programada em até 10 dias úteis",
        "Compatível com sistemas legados",
        "Atualização gratuita para próxima versão",
        "Personalizado conforme necessidade do cliente",
        "Homologado pela ANATEL"
    );

    private final UsuarioRepository usuarioRepository;
    private final VendedorRepository vendedorRepository;
    private final ClienteRepository clienteRepository;
    private final VendaRepository vendaRepository;
    private final InteracaoRepository interacaoRepository;
    private final PasswordEncoder passwordEncoder;
    private final ScoreService scoreService;

    private final ThreadLocalRandom random = ThreadLocalRandom.current();

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            VendedorRepository vendedorRepository,
            ClienteRepository clienteRepository,
            VendaRepository vendaRepository,
            InteracaoRepository interacaoRepository,
            PasswordEncoder passwordEncoder,
            ScoreService scoreService) {
        this.usuarioRepository = usuarioRepository;
        this.vendedorRepository = vendedorRepository;
        this.clienteRepository = clienteRepository;
        this.vendaRepository = vendaRepository;
        this.interacaoRepository = interacaoRepository;
        this.passwordEncoder = passwordEncoder;
        this.scoreService = scoreService;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) return;

        var vendedores = criarVendedores(QTD_VENDEDORES);
        criarAdmin();
        criarUsuariosParaVendedores(vendedores);
        var clientes = criarClientes(QTD_CLIENTES);
        criarVendas(QTD_VENDAS, vendedores, clientes);
        criarInteracoes(QTD_INTERACOES, vendedores, clientes);
        recalcularScores(clientes);
    }

    // =========================================================================
    // USUÁRIOS
    // =========================================================================

    private void criarAdmin() {
        criarUsuario("admin", "admin123", RoleUsuario.ADMIN, null);
    }

    private void criarUsuariosParaVendedores(List<Vendedor> vendedores) {
        for (var v : vendedores) {
            criarUsuario(v.getMatricula().toLowerCase(), "vendedor123", RoleUsuario.VENDEDOR, v.getId());
        }
    }

    private void criarUsuario(String username, String senha, RoleUsuario role, UUID vendedorId) {
        var u = new Usuario();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(senha));
        u.setRole(role);
        u.setVendedorId(vendedorId);
        usuarioRepository.save(u);
    }

    // =========================================================================
    // VENDEDORES
    // =========================================================================

    private List<Vendedor> criarVendedores(int qtd) {
        var list = new ArrayList<Vendedor>();
        for (int i = 1; i <= qtd; i++) {
            var v = new Vendedor();
            v.setNome(nomeAleatorio());
            v.setMatricula(String.format("V%03d", i));
            v.setDataAdmissao(dataAleatoria(LocalDate.of(2018, 1, 1), LocalDate.of(2026, 1, 1)));
            var rank = rankAleatorio();
            v.setRank(rank);
            v.setMetaMensal(metaPorRank(rank));
            v.setComissaoBase(comissaoPorRank(rank));
            vendedorRepository.save(v);
            list.add(v);
        }
        return list;
    }

    // =========================================================================
    // CLIENTES
    // =========================================================================

    private List<Cliente> criarClientes(int qtd) {
        var list = new ArrayList<Cliente>();
        for (int i = 0; i < qtd; i++) {
            var c = new Cliente();
            c.setNome(empresaAleatoria());
            c.setSegmento(SEGMENTOS.get(random.nextInt(SEGMENTOS.size())));
            c.setDataEntrada(dataAleatoria(LocalDate.of(2020, 1, 1), LocalDate.of(2026, 3, 15)));
            c.setScore(0);
            clienteRepository.save(c);
            list.add(c);
        }
        return list;
    }

    // =========================================================================
    // VENDAS
    // =========================================================================

    private void criarVendas(int qtd, List<Vendedor> vendedores, List<Cliente> clientes) {
        var ativos = clientes.subList(0, clientes.size() - QTD_CLIENTES_CHURN);
        var churn = clientes.subList(clientes.size() - QTD_CLIENTES_CHURN, clientes.size());

        // Vendas para clientes ativos (qtd - 3)
        for (int i = 0; i < qtd - 3; i++) {
            criarVenda(
                vendedorPonderado(vendedores),
                ativos.get(random.nextInt(ativos.size())),
                dataAleatoria(LocalDate.of(2025, 5, 1), LocalDate.now())
            );
        }

        // 3 vendas antigas para clientes churn
        for (int i = 0; i < 3 && i < churn.size(); i++) {
            criarVenda(
                vendedorPonderado(vendedores),
                churn.get(i),
                dataAleatoria(LocalDate.of(2024, 6, 1), LocalDate.of(2025, 4, 30))
            );
        }
    }

    private void criarVenda(Vendedor vendedor, Cliente cliente, LocalDate data) {
        var refVendedor = vendedorRepository.getReferenceById(vendedor.getId());
        var refCliente = clienteRepository.getReferenceById(cliente.getId());

        var valor = valorPorRank(vendedor.getRank());
        var status = statusPorRank(vendedor.getRank());

        var v = new Venda();
        v.setData(data);
        v.setValor(valor);
        v.setStatus(status);
        v.setComissaoPaga(status == StatusVenda.CONCLUIDA ? comissaoCalculada(valor, vendedor) : BigDecimal.ZERO);
        v.setNomeProduto(PRODUTOS.get(random.nextInt(PRODUTOS.size())));
        v.setDescricao(random.nextBoolean() ? DESCRICOES.get(random.nextInt(DESCRICOES.size())) : null);
        v.setCliente(refCliente);
        v.setVendedor(refVendedor);
        vendaRepository.save(v);
    }

    // =========================================================================
    // INTERAÇÕES
    // =========================================================================

    private void criarInteracoes(int qtd, List<Vendedor> vendedores, List<Cliente> clientes) {
        for (int i = 0; i < qtd; i++) {
            criarInteracao(
                vendedorPonderado(vendedores),
                clientes.get(random.nextInt(clientes.size())),
                dataHoraAleatoria(LocalDate.of(2025, 6, 1), LocalDate.now())
            );
        }
    }

    private void criarInteracao(Vendedor vendedor, Cliente cliente, LocalDateTime dataHora) {
        var refVendedor = vendedorRepository.getReferenceById(vendedor.getId());
        var refCliente = clienteRepository.getReferenceById(cliente.getId());

        var canal = CanalInteracao.values()[random.nextInt(CanalInteracao.values().length)];

        var i = new Interacao();
        i.setDataHora(dataHora);
        i.setCanal(canal);
        i.setDuracao(duracaoPorCanal(canal));
        i.setAvaliacao(avaliacaoPorRank(vendedor.getRank()));
        i.setCliente(refCliente);
        i.setVendedor(refVendedor);
        interacaoRepository.save(i);
    }

    // =========================================================================
    // SCORES
    // =========================================================================

    private void recalcularScores(List<Cliente> clientes) {
        for (var cliente : clientes) {
            var score = scoreService.calcular(cliente);
            cliente.setScore(Math.min(score, 100));
            clienteRepository.save(cliente);
        }
    }

    // =========================================================================
    // HELPERS - DADOS ALEATÓRIOS
    // =========================================================================

    private String nomeAleatorio() {
        return NOMES.get(random.nextInt(NOMES.size()))
            + " " + SOBRENOMES.get(random.nextInt(SOBRENOMES.size()));
    }

    private String empresaAleatoria() {
        return PREFIXOS_EMPRESA.get(random.nextInt(PREFIXOS_EMPRESA.size()))
            + " " + SUFIXOS_EMPRESA.get(random.nextInt(SUFIXOS_EMPRESA.size()));
    }

    private RankVendedor rankAleatorio() {
        double p = random.nextDouble();
        if (p < 0.30) return RankVendedor.OURO;
        if (p < 0.60) return RankVendedor.PRATA;
        if (p < 0.85) return RankVendedor.BRONZE;
        return RankVendedor.TREINAMENTO;
    }

    private BigDecimal metaPorRank(RankVendedor rank) {
        return switch (rank) {
            case OURO -> bigDecimalAleatorio(50_000, 70_000);
            case PRATA -> bigDecimalAleatorio(30_000, 45_000);
            case BRONZE -> bigDecimalAleatorio(15_000, 25_000);
            case TREINAMENTO -> bigDecimalAleatorio(8_000, 15_000);
        };
    }

    private BigDecimal comissaoPorRank(RankVendedor rank) {
        return switch (rank) {
            case OURO -> bigDecimalAleatorio(2_500, 3_500);
            case PRATA -> bigDecimalAleatorio(1_500, 2_200);
            case BRONZE -> bigDecimalAleatorio(800, 1_300);
            case TREINAMENTO -> bigDecimalAleatorio(400, 700);
        };
    }

    private BigDecimal valorPorRank(RankVendedor rank) {
        return switch (rank) {
            case OURO -> bigDecimalAleatorio(15_000, 130_000);
            case PRATA -> bigDecimalAleatorio(8_000, 45_000);
            case BRONZE -> bigDecimalAleatorio(3_000, 15_000);
            case TREINAMENTO -> bigDecimalAleatorio(1_000, 5_000);
        };
    }

    private StatusVenda statusPorRank(RankVendedor rank) {
        double p = random.nextDouble();
        double concluidaProb = switch (rank) {
            case OURO -> 0.85;
            case PRATA -> 0.75;
            case BRONZE -> 0.65;
            case TREINAMENTO -> 0.50;
        };
        if (p < concluidaProb) return StatusVenda.CONCLUIDA;
        if (p < concluidaProb + 0.10) return StatusVenda.CANCELADA;
        return StatusVenda.EM_ANALISE;
    }

    private Vendedor vendedorPonderado(List<Vendedor> vendedores) {
        double pesoTotal = 0;
        for (var v : vendedores) {
            pesoTotal += pesoRank(v.getRank());
        }
        double p = random.nextDouble() * pesoTotal;
        double acum = 0;
        for (var v : vendedores) {
            acum += pesoRank(v.getRank());
            if (p <= acum) return v;
        }
        return vendedores.getLast();
    }

    private double pesoRank(RankVendedor rank) {
        return switch (rank) {
            case OURO -> 3.0;
            case PRATA -> 2.0;
            case BRONZE -> 1.0;
            case TREINAMENTO -> 0.5;
        };
    }

    private int duracaoPorCanal(CanalInteracao canal) {
        return switch (canal) {
            case TELEFONE -> random.nextInt(5, 26);
            case WHATSAPP -> random.nextInt(5, 16);
            case EMAIL -> random.nextInt(2, 9);
            case REUNIAO -> random.nextInt(25, 71);
        };
    }

    private int avaliacaoPorRank(RankVendedor rank) {
        return switch (rank) {
            case OURO -> random.nextInt(3, 6);
            case PRATA -> random.nextInt(2, 5);
            case BRONZE -> random.nextInt(1, 5);
            case TREINAMENTO -> random.nextInt(1, 4);
        };
    }

    private BigDecimal comissaoCalculada(BigDecimal valor, Vendedor vendedor) {
        return valor.multiply(vendedor.getComissaoBase())
            .divide(vendedor.getMetaMensal(), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal bigDecimalAleatorio(double min, double max) {
        var v = min + random.nextDouble() * (max - min);
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP);
    }

    private LocalDate dataAleatoria(LocalDate inicio, LocalDate fim) {
        long dias = inicio.until(fim, ChronoUnit.DAYS);
        return inicio.plusDays(random.nextLong(dias + 1));
    }

    private LocalDateTime dataHoraAleatoria(LocalDate inicio, LocalDate fim) {
        var data = dataAleatoria(inicio, fim);
        var hora = LocalTime.of(random.nextInt(8, 18), random.nextInt(0, 60));
        return LocalDateTime.of(data, hora);
    }
}
