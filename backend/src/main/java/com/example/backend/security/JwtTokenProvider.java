package com.example.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import lombok.extern.slf4j.Slf4j; 
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Slf4j 
public class JwtTokenProvider {
    
    @Value("${app.jwt.secret:mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLongForHS256Algorithm}")
    private String jwtSecret;
    
    @Value("${app.jwt.expiration:86400000}") // 24 hours in milliseconds
    private long jwtExpirationInMs;
    
    
    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);
        
        return Jwts.builder()
                .subject(Long.toString(userPrincipal.getId()))
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
    
        
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()  // ⭐ 0.12.x: parser() (KHÔNG phải parserBuilder)
                    .verifyWith(getSigningKey())  // ⭐ 0.12.x: verifyWith() thay vì setSigningKey()
                    .build()
                    .parseSignedClaims(token)  // ⭐ 0.12.x: parseSignedClaims() thay vì parseClaimsJws()
                    .getPayload();  // ⭐ 0.12.x: getPayload() thay vì getBody()
            
            return Long.parseLong(claims.getSubject());
        } catch (Exception e) {
            log.error("Failed to extract user ID from token", e);
            throw new RuntimeException("Invalid token");
        }
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())  // ⭐ verifyWith() thay vì setSigningKey()
                    .build()
                    .parseSignedClaims(token);  // ⭐ parseSignedClaims() thay vì parseClaimsJws()
            return true;
        } catch (JwtException ex) {  // ⭐ Catch tổng quát JwtException
            log.error("Invalid JWT token: {}", ex.getMessage());
            return false;
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
            return false;
        }
    }

    /**
     * Get signing key from secret
     */
    private SecretKey getSigningKey() {  // ⭐ Return type: SecretKey (không phải Key)
        // Option 1: Nếu secret là Base64
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            // Option 2: Nếu secret là plain text
            log.warn("JWT secret is not Base64, using plain text");
            byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            
            // ⭐ Đảm bảo key đủ dài (tối thiểu 256 bits cho HS256, 512 bits cho HS512)
            if (keyBytes.length < 64) {  // 512 bits = 64 bytes
                log.warn("JWT secret is too short, padding to 64 bytes");
                byte[] paddedKey = new byte[64];
                System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 64));
                return Keys.hmacShaKeyFor(paddedKey);
            }
            
            return Keys.hmacShaKeyFor(keyBytes);
        }
    }
}
