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
import com.uern.tep.crminsight.model.entity.Usuario;
import com.uern.tep.crminsight.model.enums.RoleUsuario;
import com.uern.tep.crminsight.repository.UsuarioRepository;
import com.uern.tep.crminsight.repository.VendedorRepository;

@Service
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final VendedorRepository vendedorRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, VendedorRepository vendedorRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.vendedorRepository = vendedorRepository;
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
        if (dto.role() == RoleUsuario.VENDEDOR) {
            if (dto.vendedorId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "VENDEDOR deve ter um vendedorId vinculado");
            }
            vendedorRepository.findById(dto.vendedorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vendedor não encontrado para o vendedorId informado: " + dto.vendedorId()));
        } else if (dto.vendedorId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas usuários VENDEDOR podem ter vendedorId");
        }

        var usuario = new Usuario();
        usuario.setUsername(dto.username());
        usuario.setPassword(passwordEncoder.encode(dto.password()));
        usuario.setRole(dto.role());
        usuario.setVendedorId(dto.vendedorId());
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
            usuario.getVendedorId()
        );
    }
}
