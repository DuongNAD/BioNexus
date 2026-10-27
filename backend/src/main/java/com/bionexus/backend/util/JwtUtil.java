package com.bionexus.backend.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.Date;

public class JwtUtil {
    private static final String SECRET_KEY = "BioNexus_2026_9f8E7d6C5b4A392817263544_kL9#mP2$vX7@qR4!zW8&nJ5*yT"; // Replace with your actual secret key
    private static final long EXPIRATION_TIME = 24*60*60*1000L; // 1 day
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET_KEY);

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
