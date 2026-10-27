package com.bionexus.backend.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;

public class JwtUtil {
    private static final String SECRET_KEY = loadSecret();
    private static final long EXPIRATION_TIME = 24*60*60*1000L; // 1 day
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET_KEY);

    private static String loadSecret(){
        String s = System.getenv("JWT_SECRET");
        if (s != null && s.length() >=32) {
            return s;
        }
        byte[] b = new byte[32];
        new SecureRandom().nextBytes(b);
        System.err.println("[WARN] JWT_SECRET chưa đặt hoặc ngắn hơn 32 ký tự: dùng khóa ngẫu nhiên, token mất hiệu lực khi restart");
        return HexFormat.of().formatHex(b);
    }

    public static String generateToken(int id, String username,String accountType ,String role){
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        return JWT.create().withSubject(String.valueOf(id))
                .withClaim("username", username)
                .withClaim("accountType", accountType)
                .withClaim("role", role)
                .withIssuedAt(now)
                .withExpiresAt(expiryDate)
                .sign(ALGORITHM);
    }

    public static DecodedJWT verifyToken(String token) {
        return JWT.require(ALGORITHM).build().verify(token);
    }
}
