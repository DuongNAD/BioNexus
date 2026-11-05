package com.bionexus.backend.util;

import org.junit.jupiter.api.Test;

public class HashPrinterTest {
    @Test
    void printHashes() {
        System.out.println("User = " + PasswordUtil.hashPassword("123456"));
        System.out.println("Admin = " + PasswordUtil.hashPassword("admin123"));
    }
}
