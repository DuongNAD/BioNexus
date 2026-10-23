package com.bionexus.backend.model;

import com.bionexus.backend.enums.AdminRole;
import com.bionexus.backend.enums.AdminStatus;

import java.time.LocalDateTime;

public class Admins {
    private int adminID;
    private String fullName;
    private String account;
    private String password_hash;
    private AdminRole adminRole;
    private AdminStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Admins() {
    }

    public Admins(String fullName, String account, String password_hash, AdminRole adminRole) {
        this.fullName = fullName;
        this.account = account;
        this.password_hash = password_hash;
        this.adminRole = adminRole;
        this.status = AdminStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }

    public Admins(int adminID, String fullName, String account, String password_hash, AdminRole adminRole, AdminStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.adminID = adminID;
        this.fullName = fullName;
        this.account = account;
        this.password_hash = password_hash;
        this.adminRole = adminRole;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public int getAdminID() {
        return adminID;
    }

    public String getFullName() {
        return fullName;
    }

    public String getAccount() {
        return account;
    }

    public String getPassword_hash() {
        return password_hash;
    }

    public AdminRole getAdminRole() {
        return adminRole;
    }

    public AdminStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setAdminID(int adminID) {
        this.adminID = adminID;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public void setPassword_hash(String password_hash) {
        this.password_hash = password_hash;
    }

    public void setAdminRole(AdminRole adminRole) {
        this.adminRole = adminRole;
    }

    public void setStatus(AdminStatus status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}


