package com.uern.tep.crminsight.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.uern.tep.crminsight.model.dto.request.UsuarioRequestDTO;
import com.uern.tep.crminsight.model.dto.response.UsuarioResponseDTO;
import com.uern.tep.crminsight.model.entity.Cliente;
import com.uern.tep.crminsight.model.entity.Usuario;
import com.uern.tep.crminsight.model.entity.Vendedor;
import com.uern.tep.crminsight.model.enums.RoleUsuario;
import com.uern.tep.crminsight.repository.ClienteRepository;
import com.uern.tep.crminsight.repository.UsuarioRepository;
import com.uern.tep.crminsight.repository.VendedorRepository;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final VendedorRepository vendedorRepository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, VendedorRepository vendedorRepository, ClienteRepository clienteRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.vendedorRepository = vendedorRepository;
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));
        return User.builder()
            .username(usuario.getUsername())
            .password(usuario.getPassword())
            .roles(usuario.getRole().name())
            .build();
    }

    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
            .map(this::toResponseDTO)
            .toList();
    }

    public UsuarioResponseDTO buscarPorId(UUID id) {
        return toResponseDTO(usuarioRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado: " + id)));
    }

    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
        if (usuarioRepository.findByUsername(dto.username()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username já existe: " + dto.username());
        }

        if (dto.role() == RoleUsuario.CLIENTE) {
            if (dto.nome() == null || dto.nome().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome é obrigatório para CLIENTE");
            }
            if (dto.segmento() == null || dto.segmento().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Segmento é obrigatório para CLIENTE");
            }

            var cliente = new Cliente();
            cliente.setNome(dto.nome());
            cliente.setSegmento(dto.segmento());
            cliente.setDataEntrada(java.time.LocalDate.now());
            cliente.setScore(50);
            cliente = clienteRepository.save(cliente);

            var usuario = new Usuario();
            usuario.setUsername(dto.username());
            usuario.setPassword(passwordEncoder.encode(dto.password()));
            usuario.setRole(RoleUsuario.CLIENTE);
            usuario.setClienteId(cliente.getId());
            usuario = usuarioRepository.save(usuario);
            return toResponseDTO(usuario);
        }

        if (dto.role() == RoleUsuario.VENDEDOR) {
            if (dto.nome() == null || dto.nome().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome é obrigatório para VENDEDOR");
            }
            if (dto.matricula() == null || dto.matricula().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Matrícula é obrigatória para VENDEDOR");
            }
            if (dto.dataAdmissao() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data de admissão é obrigatória para VENDEDOR");
            }
            if (dto.metaMensal() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Meta mensal é obrigatória para VENDEDOR");
            }
            if (dto.comissaoBase() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comissão base é obrigatória para VENDEDOR");
            }
            if (dto.rank() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rank é obrigatório para VENDEDOR");
            }
            if (vendedorRepository.findByMatricula(dto.matricula()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Matrícula já cadastrada: " + dto.matricula());
            }

            var vendedor = new Vendedor();
            vendedor.setNome(dto.nome());
            vendedor.setMatricula(dto.matricula());
            vendedor.setDataAdmissao(dto.dataAdmissao());
            vendedor.setMetaMensal(dto.metaMensal());
            vendedor.setComissaoBase(dto.comissaoBase());
            vendedor.setRank(dto.rank());
            vendedor = vendedorRepository.save(vendedor);

            var usuario = new Usuario();
            usuario.setUsername(dto.username());
            usuario.setPassword(passwordEncoder.encode(dto.password()));
            usuario.setRole(RoleUsuario.VENDEDOR);
            usuario.setVendedorId(vendedor.getId());
            usuario = usuarioRepository.save(usuario);
            return toResponseDTO(usuario);
        }

        var usuario = new Usuario();
        usuario.setUsername(dto.username());
        usuario.setPassword(passwordEncoder.encode(dto.password()));
        usuario.setRole(RoleUsuario.ADMIN);
        usuario.setVendedorId(null);
        usuario.setClienteId(null);
        usuario = usuarioRepository.save(usuario);
        return toResponseDTO(usuario);
    }

    public Usuario buscarPorUsername(String username) {
        return usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));
    }

    private UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
            usuario.getId(),
            usuario.getUsername(),
            usuario.getRole(),
            usuario.getVendedorId(),
            usuario.getClienteId()
        );
    }
}
