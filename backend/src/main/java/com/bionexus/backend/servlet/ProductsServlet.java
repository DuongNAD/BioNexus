package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.service.ProductService;
import com.bionexus.backend.util.ApiErrors;
import com.bionexus.backend.util.ApiException;
import com.bionexus.backend.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/** Sản phẩm công khai: GET /api/products?speciesId=&q=&page=&size= và GET /api/products/{id}. */
@WebServlet("/api/products/*")
public class ProductsServlet extends HttpServlet {
    private final ProductService productService = new ProductService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();
        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                Integer speciesId = parseOptionalInt(request.getParameter("speciesId"), MessageKey.INVALID_ID);
                int page = parseOptionalInt(request.getParameter("page"), MessageKey.INVALID_PAGINATION, 1);
                int size = parseOptionalInt(request.getParameter("size"), MessageKey.INVALID_PAGINATION,
                        ProductService.DEFAULT_PAGE_SIZE);
                JsonUtil.writeBody(response, 200,
                        ApiResponse.ok(productService.searchApprovedProducts(speciesId, request.getParameter("q"), page, size)));
                return;
            }

            String[] parts = pathInfo.substring(1).split("/");
            if (parts.length == 1) {
                int productId = Integer.parseInt(parts[0]); // không phải số thì NumberFormatException → 400 INVALID_ID
                JsonUtil.writeBody(response, 200, ApiResponse.ok(productService.getProductDetail(productId)));
                return;
            }

            JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }

    /** Tham số số nguyên tùy chọn: thiếu hoặc rỗng thì null; không phải số thì ném lỗi với key đã cho. */
    private static Integer parseOptionalInt(String value, MessageKey errorKey) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            throw new ApiException(errorKey);
        }
    }

    private static int parseOptionalInt(String value, MessageKey errorKey, int fallback) {
        Integer parsed = parseOptionalInt(value, errorKey);
        return parsed == null ? fallback : parsed;
    }
}
