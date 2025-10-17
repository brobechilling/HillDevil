package com.example.backend.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class SubscriptionPaymentResponse {
    private UUID subscriptionPaymentId;
    private BigDecimal amount;
    private String payOsOrderCode;
    private String payOsTransactionCode;
    private String checkoutUrl;
    private String paymentStatus;
    private Instant date;

    public UUID getSubscriptionPaymentId() {
        return subscriptionPaymentId;
    }

    public void setSubscriptionPaymentId(UUID subscriptionPaymentId) {
        this.subscriptionPaymentId = subscriptionPaymentId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPayOsOrderCode() {
        return payOsOrderCode;
    }

    public void setPayOsOrderCode(String payOsOrderCode) {
        this.payOsOrderCode = payOsOrderCode;
    }

    public String getPayOsTransactionCode() {
        return payOsTransactionCode;
    }

    public void setPayOsTransactionCode(String payOsTransactionCode) {
        this.payOsTransactionCode = payOsTransactionCode;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public void setCheckoutUrl(String checkoutUrl) {
        this.checkoutUrl = checkoutUrl;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }
}
