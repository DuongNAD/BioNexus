package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.service.TaxonomyService;
import com.bionexus.backend.util.ApiErrors;
import com.bionexus.backend.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/taxonomy/*")
public class TaxonomyServlet extends HttpServlet {
    private final TaxonomyService taxonomyService = new TaxonomyService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();

        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                JsonUtil.writeBody(response, 200, ApiResponse.ok(taxonomyService.getRootNodes()));
                return;
            }

            String[] parts = pathInfo.substring(1).split("/");
            int id = Integer.parseInt(parts[0]); // không phải số thì NumberFormatException → 400 INVALID_ID

            if (parts.length == 1) {
                JsonUtil.writeBody(response, 200, ApiResponse.ok(taxonomyService.getTaxonomyDetail(id)));
                return;
            }

            if (parts.length == 2) {
                if ("children".equals(parts[1])) {
                    JsonUtil.writeBody(response, 200, ApiResponse.ok(taxonomyService.getChildNodes(id)));
                    return;
                } else if ("species".equals(parts[1])) {
                    JsonUtil.writeBody(response, 200, ApiResponse.ok(taxonomyService.getSpeciesByNodeId(id)));
                    return;
                }
            }

            JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }
}
