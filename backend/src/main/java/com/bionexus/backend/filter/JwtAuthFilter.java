package com.bionexus.backend.filter;

import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.bionexus.backend.dal.AdminsDao;
import com.bionexus.backend.dal.UsersDao;
import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.enums.AccountType;
import com.bionexus.backend.enums.AdminStatus;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.enums.UserStatus;
import com.bionexus.backend.model.Admins;
import com.bionexus.backend.model.Users;
import com.bionexus.backend.util.JsonUtil;
import com.bionexus.backend.util.JwtUtil;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Base64;

@WebFilter(urlPatterns = {"/api/me", "/api/seller/*", "/api/admin/*", "/api/orders/*","/api/cart/*"})
public class JwtAuthFilter implements Filter {
    private final UsersDao usersDao = new UsersDao();
    private final AdminsDao adminsDao = new AdminsDao();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            JsonUtil.writeBody(httpResponse,401, ApiResponse.error(MessageKey.AUTH_UNAUTHORIZED));
            return;
        }

        String token = authHeader.substring(7).trim();
        DecodedJWT jwt;
        try{
            jwt = JwtUtil.verifyToken(token);
        }
        catch (TokenExpiredException e){
            JsonUtil.writeBody(httpResponse,401, ApiResponse.error(MessageKey.AUTH_TOKEN_EXPIRED));
            return;
        }
        catch (Exception e){
            JsonUtil.writeBody(httpResponse,401, ApiResponse.error(MessageKey.AUTH_TOKEN_INVALID));
            return;
        }

        int id = Integer.parseInt(jwt.getSubject());
        String accountType = jwt.getClaim("accountType").asString();
        String path = ((HttpServletRequest) request).getServletPath();


        if (AccountType.ADMIN.name().equals(accountType)) {
            Admins admin = adminsDao.getAdminById(id);
            if (admin == null || admin.getStatus() != AdminStatus.ACTIVE) {
                JsonUtil.writeBody(httpResponse, 403, ApiResponse.error(MessageKey.AUTH_ACCOUNT_BANNED));
                return;
            }
            httpRequest.setAttribute("authId", admin.getAdminID());
            httpRequest.setAttribute("authAccountType", AccountType.ADMIN.name());
            httpRequest.setAttribute("authRole", admin.getAdminRole().name());
        } else if (AccountType.USER.name().equals(accountType)) {
            if (path != null && path.startsWith("/api/admin")) {
                JsonUtil.writeBody(httpResponse, 403, ApiResponse.error(MessageKey.AUTH_FORBIDDEN));
                return;
            }
            Users user = usersDao.getUserById(id);
            if (user == null || user.getUserStatus() != UserStatus.ACTIVE) {
                JsonUtil.writeBody(httpResponse, 403, ApiResponse.error(MessageKey.AUTH_ACCOUNT_BANNED));
                return;
            }
            httpRequest.setAttribute("authId", user.getUserId());
            httpRequest.setAttribute("authAccountType", AccountType.USER.name());
            httpRequest.setAttribute("authRole", "USER");
        } else {
            JsonUtil.writeBody(httpResponse, 401, ApiResponse.error(MessageKey.AUTH_TOKEN_INVALID));
            return;
        }
            chain.doFilter(httpRequest, httpResponse);
    }
}
