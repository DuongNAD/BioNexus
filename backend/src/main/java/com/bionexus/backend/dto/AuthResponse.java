package com.bionexus.backend.dto;

public class AuthResponse {
    private String token;
    private int id;
    private String username;
    private String fullName;
    private String password;
    private String accountType;
    private String role;

    public AuthResponse(String token, int id, String username, String fullName, String password, String accountType, String role) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.password = password;
        this.accountType = accountType;
        this.role = role;
    }

    public AuthResponse() {
    }

    public String getToken() {
        return token;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPassword() {
        return password;
    }

    public String getAccountType() {
        return accountType;
    }

    public String getRole() {
        return role;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
