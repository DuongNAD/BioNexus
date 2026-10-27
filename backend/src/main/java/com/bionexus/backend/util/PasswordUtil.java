package com.bionexus.backend.util;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtil {
    public static String hashPassword(String plainPassword) {
        String hashedPassword = BCrypt.hashpw(plainPassword, BCrypt.gensalt(10));
        return hashedPassword;
    }

    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null) {
            return false;
        }
        if(hashedPassword.startsWith("$2y$") || hashedPassword.startsWith("$2b$")) {
            hashedPassword = "$2a$" + hashedPassword.substring(4);
        }
        if(hashedPassword.startsWith("$2a$")){
            return BCrypt.checkpw(plainPassword, hashedPassword);
        }
        return false;
    }
}
