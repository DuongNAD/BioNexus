package com.bionexus.backend.dto;

import com.bionexus.backend.enums.MessageKey;

public class ApiResponse<T> {
    private boolean success;
    private String code;
    private String message;
    private T data;


    public ApiResponse() {}

    public ApiResponse(boolean success, String code, String message, T data) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> ok ( T data) {
        return new ApiResponse<>(true, MessageKey.SUCCESS.name(), MessageKey.SUCCESS.getMessage("vi"), data);
    }

    public static <T> ApiResponse<T> error(MessageKey key) {
        return new ApiResponse<>(false, key.name(), key.getMessage("vi"), null);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

    public String getCode() {
        return code;
    }

}
