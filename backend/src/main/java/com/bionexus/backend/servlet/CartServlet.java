package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.AddCartItemRequest;
import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.dto.UpdateCartItemRequest;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.service.CartService;
import com.bionexus.backend.util.ApiErrors;
import com.bionexus.backend.util.ApiException;
import com.bionexus.backend.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * Giỏ hàng của người dùng (/api/cart/*). JwtAuthFilter đã yêu cầu đăng nhập và chặn token ADMIN.
 * GET /api/cart | POST /api/cart/items | PUT và DELETE /api/cart/items/{productId} | DELETE /api/cart
 */
@WebServlet("/api/cart/*")
public class CartServlet extends HttpServlet {
    private final CartService cartService = new CartService();

    private static boolean isRoot(String path) {
        return path == null || path.equals("/");
    }

    /** Lấy productId từ "/items/{productId}"; sai dạng đường dẫn thì trả null, id không phải số dương thì INVALID_ID. */
    private static Integer productIdFrom(String path) {
        if (path == null) {
            return null;
        }
        String[] parts = path.substring(1).split("/");
        if (parts.length != 2 || !"items".equals(parts[0])) {
            return null;
        }
        int id = Integer.parseInt(parts[1]); // không phải số thì NumberFormatException → 400 INVALID_ID
        if (id <= 0) {
            throw new ApiException(MessageKey.INVALID_ID);
        }
        return id;
    }

    private static void notFound(HttpServletResponse response) throws IOException {
        JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            if (!isRoot(request.getPathInfo())) {
                notFound(response);
                return;
            }
            int userId = (int) request.getAttribute("authId");
            JsonUtil.writeBody(response, 200, ApiResponse.ok(cartService.getCart(userId)));
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            if (!"/items".equals(request.getPathInfo())) {
                notFound(response);
                return;
            }
            int userId = (int) request.getAttribute("authId");
            AddCartItemRequest body = JsonUtil.readBody(request, AddCartItemRequest.class);
            if (body == null) throw new ApiException(MessageKey.BAD_REQUEST);
            JsonUtil.writeBody(response, 200, ApiResponse.ok(MessageKey.CART_ITEM_ADDED,
                    cartService.addItem(userId, body.productId(), body.quantity())));
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            Integer productId = productIdFrom(request.getPathInfo());
            if (productId == null) {
                notFound(response);
                return;
            }
            int userId = (int) request.getAttribute("authId");
            UpdateCartItemRequest body = JsonUtil.readBody(request, UpdateCartItemRequest.class);
            if (body == null) throw new ApiException(MessageKey.BAD_REQUEST);
            JsonUtil.writeBody(response, 200, ApiResponse.ok(MessageKey.CART_ITEM_UPDATED,
                    cartService.setQuantity(userId, productId, body.quantity())));
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            int userId = (int) request.getAttribute("authId");
            String path = request.getPathInfo();
            if (isRoot(path)) {
                JsonUtil.writeBody(response, 200, ApiResponse.ok(MessageKey.CART_CLEARED, cartService.clear(userId)));
                return;
            }
            Integer productId = productIdFrom(path);
            if (productId == null) {
                notFound(response);
                return;
            }
            JsonUtil.writeBody(response, 200, ApiResponse.ok(MessageKey.CART_ITEM_REMOVED,
                    cartService.removeItem(userId, productId)));
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }
}
