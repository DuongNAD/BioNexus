package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.service.ProductService;
import com.bionexus.backend.util.ApiException;
import com.bionexus.backend.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet("/api/products/*")
public class ProductsServlet extends HttpServlet {
    private final ProductService productService = new ProductService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();
        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                String speciesIdParam = request.getParameter("speciesId");
                Integer speciesId = null;
                if (speciesIdParam != null && !speciesIdParam.isEmpty()) {
                    speciesId = Integer.parseInt(speciesIdParam);
                }
                JsonUtil.writeBody(response, 200, ApiResponse.ok(productService.getApprovedProducts(speciesId)));
                return;
            }

            String[] parts = pathInfo.substring(1).split("/");
            if (parts.length == 1) {
                int productId = Integer.parseInt(parts[0]);
                JsonUtil.writeBody(response, 200, ApiResponse.ok(productService.getProductDetail(productId)));
                return;
            }


            JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
        } catch (NumberFormatException e) {
            JsonUtil.writeBody(response, 400, ApiResponse.error(MessageKey.INVALID_ID));
        } catch (ApiException e) {
            JsonUtil.writeBody(response, 404, ApiResponse.error(e.getMessageKey()));
        } catch (Exception e) {
            e.printStackTrace();
            JsonUtil.writeBody(response, 500, ApiResponse.error(MessageKey.INTERNAL_ERROR));
        }

    }
}
