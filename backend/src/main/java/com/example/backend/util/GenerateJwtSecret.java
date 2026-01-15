package com.example.backend.util;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Base64;

public class GenerateJwtSecret {
    public static void main(String[] args) {
        // Tạo key an toàn cho HS512
        var key = Keys.secretKeyFor(SignatureAlgorithm.HS512);
        String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());
        
        System.out.println("=".repeat(60));
        System.out.println("NEW JWT SECRET (Base64):");
        System.out.println(base64Key);
        System.out.println("=".repeat(60));
        System.out.println("Copy secret này vào application.properties");
    }
}