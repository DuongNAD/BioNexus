package com.bionexus.backend.model;

import java.time.LocalDateTime;

public class Admins {
    private int adminID;
    private String fullName;
    private String account;
    private String password_hash;
    private String adminRole;
    private LocalDateTime createdAt;

    public Admins() {}

    public Admins(String fullName, String account, String password_hash, String adminRole) {
        this.fullName = fullName;
        this.account = account;
        this.password_hash = password_hash;
        this.adminRole = adminRole;
        this.createdAt = LocalDateTime.now();
    }

    public int getAdminID() {
        return adminID;
    }

    public void setAdminID(int adminID) {
        this.adminID = adminID;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getPassword_hash() {
        return password_hash;
    }

    public void setPassword_hash(String password_hash) {
        this.password_hash = password_hash;
    }

    public String getAdminRole() {
        return adminRole;
    }

    public void setAdminRole(String adminRole) {
        this.adminRole = adminRole;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

