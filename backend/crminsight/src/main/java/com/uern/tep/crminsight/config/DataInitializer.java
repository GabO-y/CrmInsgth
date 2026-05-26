package com.uern.tep.crminsight.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.uern.tep.crminsight.model.entity.Usuario;
import com.uern.tep.crminsight.model.enums.RoleUsuario;
import com.uern.tep.crminsight.repository.UsuarioRepository;
import com.uern.tep.crminsight.repository.VendedorRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final VendedorRepository vendedorRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, VendedorRepository vendedorRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.vendedorRepository = vendedorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) return;

        var admin = new Usuario();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(RoleUsuario.ADMIN);
        admin.setVendedorId(null);
        usuarioRepository.save(admin);

        vendedorRepository.findAll().forEach(v -> {
            if (usuarioRepository.findByVendedorId(v.getId()).isPresent()) return;
            var usuario = new Usuario();
            usuario.setUsername(v.getMatricula().toLowerCase());
            usuario.setPassword(passwordEncoder.encode("vendedor123"));
            usuario.setRole(RoleUsuario.VENDEDOR);
            usuario.setVendedorId(v.getId());
            usuarioRepository.save(usuario);
        });
    }
}
