package com.bionexus.backend.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class JsonUtil {
    private static final Gson gson = new GsonBuilder()
            .serializeNulls()
            .disableHtmlEscaping()
            .create();

    public static <T> T readBody(HttpServletRequest request, Class<T> clazz) throws IOException {
        request.setCharacterEncoding("UTF-8");
        return gson.fromJson(request.getReader(), clazz);
    }

    public static <T> void writeBody(HttpServletResponse response,int statusCode, T obj) throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(gson.toJson(obj));
    }
}
