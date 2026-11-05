package com.bionexus.backend.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.SignatureVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/** 4 trường hợp của PLAN Ngày 3: token hợp lệ, hết hạn, sai chữ ký, sửa payload thành ADMIN. */
class JwtUtilTest {

    @Test
    void validTokenIsAccepted() {
        String token = JwtUtil.generateToken(7, "levanc", "USER", "USER");
        DecodedJWT jwt = JwtUtil.verifyToken(token);
        assertEquals("7", jwt.getSubject());
        assertEquals("levanc", jwt.getClaim("username").asString());
        assertEquals("USER", jwt.getClaim("accountType").asString());
    }

    @Test
    void expiredTokenIsRejected() {
        String token = JwtUtil.generateToken(7, "levanc", "USER", "USER", -60_000L); // hết hạn 1 phút trước
        assertThrows(TokenExpiredException.class, () -> JwtUtil.verifyToken(token));
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        String forged = JWT.create()
                .withSubject("7")
                .withClaim("accountType", "ADMIN")
                .withExpiresAt(new Date(System.currentTimeMillis() + 60_000L))
                .sign(Algorithm.HMAC256("mot-bi-mat-khac-hoan-toan-dai-hon-32-ky-tu"));
        assertThrows(SignatureVerificationException.class, () -> JwtUtil.verifyToken(forged));
    }

    @Test
    void tamperedPayloadIsRejected() {
        String token = JwtUtil.generateToken(7, "levanc", "USER", "USER");
        String[] parts = token.split("\\.");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        String tampered = payload.replace("\"accountType\":\"USER\"", "\"accountType\":\"ADMIN\"");
        assertEquals(false, tampered.equals(payload), "payload phải thật sự bị sửa");
        String forgedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(tampered.getBytes(StandardCharsets.UTF_8));
        String forged = parts[0] + "." + forgedPayload + "." + parts[2]; // giữ nguyên chữ ký cũ
        assertThrows(JWTVerificationException.class, () -> JwtUtil.verifyToken(forged));
    }
}
