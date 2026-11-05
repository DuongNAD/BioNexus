package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.service.UserService;
import com.bionexus.backend.util.ApiErrors;
import com.bionexus.backend.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet(name = "MeServlet", urlPatterns = {"/api/me"})
public class MeServlet extends HttpServlet {
    private final UserService userService = new UserService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            int userId = (int) request.getAttribute("authId"); // JwtAuthFilter đã nạp
            JsonUtil.writeBody(response, 200, ApiResponse.ok(userService.getMe(userId)));
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }
}
