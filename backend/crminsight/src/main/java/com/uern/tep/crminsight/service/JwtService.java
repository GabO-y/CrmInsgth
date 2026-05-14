package com.uern.tep.crminsight.service;

import java.time.Instant;
import java.util.Base64;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.uern.tep.crminsight.model.entity.Usuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration}") long expiration) {
        var decoded = Base64.getDecoder().decode(secret);
        this.secretKey = Keys.hmacShaKeyFor(decoded);
        this.expiration = expiration;
    }

    public String gerarToken(Usuario usuario) {
        var agora = Instant.now();
        return Jwts.builder()
            .subject(usuario.getUsername())
            .claim("role", usuario.getRole().name())
            .claim("vendedorId", usuario.getVendedorId() != null ? usuario.getVendedorId().toString() : null)
            .issuedAt(java.util.Date.from(agora))
            .expiration(java.util.Date.from(agora.plusMillis(expiration)))
            .signWith(secretKey)
            .compact();
    }

    public String extrairUsername(String token) {
        return extrairClaims(token).getPayload().getSubject();
    }

    public boolean isTokenValido(String token) {
        try {
            extrairClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Jws<Claims> extrairClaims(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token);
    }
}
