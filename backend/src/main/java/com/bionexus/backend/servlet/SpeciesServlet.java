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

@WebServlet("/api/species/*")
public class SpeciesServlet extends HttpServlet {
    private final TaxonomyService taxonomyService = new TaxonomyService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pathInfo = request.getPathInfo();
        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                // Danh sách loài cho bách khoa: ?nodeId=&q=&iucn= (đều tùy chọn)
                String nodeIdParam = request.getParameter("nodeId");
                Integer nodeId = null;
                if (nodeIdParam != null && !nodeIdParam.isBlank()) {
                    nodeId = Integer.parseInt(nodeIdParam.trim()); // không phải số thì NumberFormatException → 400 INVALID_ID
                }
                JsonUtil.writeBody(response, 200, ApiResponse.ok(
                        taxonomyService.searchSpecies(nodeId, request.getParameter("q"), request.getParameter("iucn"))));
                return;
            }

            String[] parts = pathInfo.substring(1).split("/");
            int speciesId = Integer.parseInt(parts[0]); // không phải số thì NumberFormatException → 400 INVALID_ID

            if (parts.length == 1) {
                JsonUtil.writeBody(response, 200, ApiResponse.ok(taxonomyService.getSpeciesDetail(speciesId)));
                return;
            }

            JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }
}
