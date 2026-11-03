package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.service.AuthService;
import com.bionexus.backend.util.JsonUtil;
import com.google.gson.stream.JsonWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet(name = "MeServlet", urlPatterns = "/api/me")
public class MeServlet extends HttpServlet {
    private final AuthService authService = new AuthService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try{
            String accountType = (String) request.getAttribute("authAccountType");
            Integer authId = (Integer) request.getAttribute("authId");
            if (accountType == null || authId == null) {
                JsonUtil.writeBody(response, 401, ApiResponse.error(MessageKey.AUTH_UNAUTHORIZED));
                return
            }
        }
    }
}
