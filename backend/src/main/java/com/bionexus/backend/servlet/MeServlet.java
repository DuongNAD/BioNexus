package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.service.UserService;
import com.bionexus.backend.util.ApiException;
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
            int userId = (int) request.getAttribute("authId");
            JsonUtil.writeBody(response,200, ApiResponse.ok(userService.getMe(userId)));
        }
        catch (ApiException e) {
            JsonUtil.writeBody(response,404, ApiResponse.error(e.getMessageKey()));
        }
        catch (Exception e) {
            e.printStackTrace();
            JsonUtil.writeBody(response,500, ApiResponse.error(MessageKey.INTERNAL_ERROR));
        }
    }
}
