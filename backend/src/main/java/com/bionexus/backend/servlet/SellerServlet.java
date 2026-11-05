package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.dto.CreateProductRequest;
import com.bionexus.backend.dto.SellerApplyRequest;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.service.SellerService;
import com.bionexus.backend.util.ApiErrors;
import com.bionexus.backend.util.ApiException;
import com.bionexus.backend.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/seller/*")
public class SellerServlet extends HttpServlet {
    private final SellerService sellerService = new SellerService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            int userId = (int) request.getAttribute("authId");
            String path = request.getPathInfo();

            if ("/apply".equals(path)) {
                SellerApplyRequest body = JsonUtil.readBody(request, SellerApplyRequest.class);
                if (body == null) throw new ApiException(MessageKey.BAD_REQUEST);
                var shop = sellerService.applyShop(userId, body.shopName(), body.businessLicenseUrl(), body.bio());
                JsonUtil.writeBody(response, 201, ApiResponse.ok(MessageKey.SELLER_APPLY_SUCCESS, shop));
            } else if ("/products".equals(path)) {
                CreateProductRequest body = JsonUtil.readBody(request, CreateProductRequest.class);
                if (body == null) throw new ApiException(MessageKey.BAD_REQUEST);
                var product = sellerService.createProduct(userId, body);
                JsonUtil.writeBody(response, 201, ApiResponse.ok(MessageKey.PRODUCT_SUBMITTED, product));
            } else {
                JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
            }
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            if ("/products".equals(request.getPathInfo())) {
                int userId = (int) request.getAttribute("authId");
                JsonUtil.writeBody(response, 200, ApiResponse.ok(sellerService.getMyProducts(userId)));
            } else {
                JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
            }
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }
}