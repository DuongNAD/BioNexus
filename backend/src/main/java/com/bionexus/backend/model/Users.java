package com.bionexus.backend.model;
import com.bionexus.backend.enums.UserStatus;

import java.time.LocalDateTime;

public class Users {
    private int userId;
    private String username;
    private String passwordHash;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private UserStatus userStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Users() {}
    public Users(String username,String passwordHash, String email,  String fullName, String phone, String address) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
        this.userStatus = UserStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }

    public Users(int userId, String username, String passwordHash,String email,  String fullName, String phone, String address,UserStatus userStatus, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.userId = userId;
        this.username = username;
        this.passwordHash = passwordHash;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
        this.userStatus = userStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    

    public int getUserId() {
        return userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getAddress() {
        return address;
    }

    public String getPhone() {
        return phone;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
    }
    public UserStatus getUserStatus() {
        return userStatus;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
