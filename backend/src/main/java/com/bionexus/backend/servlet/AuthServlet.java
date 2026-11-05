package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.dto.AuthResponse;
import com.bionexus.backend.dto.LoginRequest;
import com.bionexus.backend.dto.RegisterRequest;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.service.AuthService;
import com.bionexus.backend.util.ApiErrors;
import com.bionexus.backend.util.ApiException;
import com.bionexus.backend.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {
    private final AuthService authService = new AuthService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();
        if (pathInfo == null) {
            JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
            return;
        }

        try {
            if ("/login".equals(pathInfo)) {
                LoginRequest loginRequest = JsonUtil.readBody(request, LoginRequest.class);
                if (loginRequest == null) throw new ApiException(MessageKey.BAD_REQUEST);
                AuthResponse authResponse = authService.loginUser(loginRequest);
                JsonUtil.writeBody(response, 200, ApiResponse.ok(authResponse));
                return;
            }

            if ("/loginAdmin".equals(pathInfo) || "/admin/login".equals(pathInfo)) {
                LoginRequest loginRequest = JsonUtil.readBody(request, LoginRequest.class);
                if (loginRequest == null) throw new ApiException(MessageKey.BAD_REQUEST);
                AuthResponse authResponse = authService.loginAdmin(loginRequest);
                JsonUtil.writeBody(response, 200, ApiResponse.ok(authResponse));
                return;
            }

            if ("/register".equals(pathInfo)) {
                RegisterRequest registerRequest = JsonUtil.readBody(request, RegisterRequest.class);
                AuthResponse authResponse = authService.registerUser(registerRequest);
                JsonUtil.writeBody(response, 201, ApiResponse.ok(authResponse));
                return;
            }
            JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
        } catch (Exception e) {
            // Mã HTTP theo bảng chung trong ApiErrors (401 sai tài khoản, 403 bị khóa, 409 trùng...)
            ApiErrors.write(response, e);
        }
    }
}
