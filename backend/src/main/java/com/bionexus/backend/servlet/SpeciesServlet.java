package com.bionexus.backend.servlet;


import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.dto.SpeciesDto;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.service.TaxonomyService;
import com.bionexus.backend.util.ApiException;
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
                JsonUtil.writeBody(response, 400, ApiResponse.error(MessageKey.NOT_FOUND));
                return;
            }

            String[] parts = pathInfo.substring(1).split("/");
            int speciesId = Integer.parseInt(parts[0]);

            if (parts.length == 1) {
                int id = Integer.parseInt(parts[0]);
                SpeciesDto speciesDetail = taxonomyService.getSpeciesDetail(id);
                JsonUtil.writeBody(response, 200, ApiResponse.ok(speciesDetail));
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
