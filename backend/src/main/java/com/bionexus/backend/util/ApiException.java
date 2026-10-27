package com.bionexus.backend.util;

import com.bionexus.backend.enums.MessageKey;

public class ApiException extends RuntimeException {
    private final MessageKey messageKey;

    public ApiException(MessageKey messageKey) {
        super(messageKey.name());
        this.messageKey = messageKey;
    }

    public MessageKey getMessageKey() {
        return messageKey;
    }
}
