package com.bionexus.backend.dal;

import java.io.*;
import java.sql.Connection;
import java.sql.SQLException;

import jakarta.servlet.http.*;
import jakarta.servlet.annotation.*;

public class DBContext{
    private static final String URL = "jdbc:sqlserver://localhost:1433;databaseName=BioNexusDB;encrypt=true;trustServerCertificate=true";
    private static final String USERNAME = "admin";
    private static final String PASSWORD = "123";

    public static Connection getConnection() throws SQLException, ClassNotFoundException {
        Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        return java.sql.DriverManager.getConnection(URL, USERNAME, PASSWORD);
    }

    public static void main(String[] args) throws SQLException, ClassNotFoundException {
        try (Connection connection = getConnection()) {
            if (connection != null) {
                System.out.println("Connected to the database!");
            }
        } catch (SQLException | ClassNotFoundException e) {
            System.out.println("Error connecting to the database: " + e.getMessage());
            e.printStackTrace();
        }
    }
}