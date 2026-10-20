package com.bionexus.backend.model;

import com.bionexus.backend.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Orders {
    private long orderId;
    private String orderCode;
    private int userId;
    private LocalDateTime orderDate;
    private BigDecimal orderAmount;
    private OrderStatus status;
    private String shippingAddress;

    public Orders() {}
    public Orders(long orderId, String orderCode, int userId, LocalDateTime orderDate, BigDecimal orderAmount, OrderStatus status, String shippingAddress) {
        this.orderId = orderId;
        this.orderCode = orderCode;
        this.userId = userId;
        this.orderDate = orderDate;
        this.orderAmount = orderAmount;
        this.status = status;
        this.shippingAddress = shippingAddress;
    }

    public Orders(String orderCode, int userId, BigDecimal orderAmount, OrderStatus status, String shippingAddress) {
        this.orderCode = orderCode;
        this.userId = userId;
        this.orderDate = LocalDateTime.now();
        this.orderAmount = orderAmount;
        this.status = status;
        this.shippingAddress = shippingAddress;
    }

    public long getOrderId() {
        return orderId;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public int getUserId() {
        return userId;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public BigDecimal getOrderAmount() {
        return orderAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setOrderId(long orderId) {
        this.orderId = orderId;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public void setOrderAmount(BigDecimal orderAmount) {
        this.orderAmount = orderAmount;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}
