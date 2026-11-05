package com.bionexus.backend.util;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.enums.MessageKey;
import com.google.gson.JsonSyntaxException;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ApiErrors {
    private static final Logger LOG = Logger.getLogger(ApiErrors.class.getName());
    private ApiErrors(){}

    public static int statusOf(MessageKey key){
        return switch (key){
            case AUTH_INVALID_CREDENTIALS, AUTH_UNAUTHORIZED, AUTH_TOKEN_EXPIRED, AUTH_TOKEN_INVALID -> 401;
            case AUTH_FORBIDDEN,AUTH_ACCOUNT_INACTIVE,AUTH_ACCOUNT_BANNED,SELLER_NOT_ACTIVE,PRODUCT_NOT_OWNED,ORDER_OWN_PRODUCT -> 403;
            case NOT_FOUND, USER_NOT_FOUND,SELLER_NOT_FOUND,SPECIES_NOT_FOUND,PRODUCT_NOT_FOUND,TAXONOMY_NOT_FOUND,ORDER_NOT_FOUND,CART_ITEM_NOT_FOUND -> 404;
            case CONFLICT, USER_USERNAME_EXISTS, USER_EMAIL_EXISTS, SELLER_ALREADY_REGISTERED, PRODUCT_INVALID_STATUS_TRANSITION, PRODUCT_OUT_OF_STOCK , SELLER_SHOP_NAME_EXISTS, SELLER_INVALID_STATUS_TRANSITION, PRODUCT_NOT_AVAILABLE, ORDER_CANNOT_CANCEL, CART_QUANTITY_EXCEEDS_STOCK, TAXONOMY_NAME_EXISTS, SPECIES_NAME_EXISTS -> 409;
            case INTERNAL_ERROR -> 500;
            default -> 400;

        };
    }

    public static void write(HttpServletResponse response, Exception e) throws IOException {
        if(e instanceof ApiException ae){
            JsonUtil.writeBody(response,statusOf(ae.getMessageKey()), ApiResponse.error(ae.getMessageKey()));
        }
        else if(e instanceof  NumberFormatException){
            JsonUtil.writeBody(response,400, ApiResponse.error(MessageKey.INVALID_ID));
        }
        else if(e instanceof JsonSyntaxException){
            JsonUtil.writeBody(response,400, ApiResponse.error(MessageKey.INVALID_JSON));
        }
        else {
            LOG.log(Level.SEVERE, "Lỗi không xác định", e);
            JsonUtil.writeBody(response,500, ApiResponse.error(MessageKey.INTERNAL_ERROR));
        }
    }
}
