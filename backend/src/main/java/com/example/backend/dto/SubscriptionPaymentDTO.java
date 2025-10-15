package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class SubscriptionPaymentDTO {
    private UUID subscriptionPaymentId;
    private UUID subscriptionId;
    private BigDecimal amount;
    private String payOsOrderCode;
    private String payOsTransactionCode;
    private String checkoutUrl;
    private String paymentStatus;
    private String responsePayload;
    private String webhookPayload;
    private boolean webhookStatus;
    private boolean signatureVerified;
    private Instant date;

    // Getters & Setters
    public UUID getSubscriptionPaymentId() {
        return subscriptionPaymentId;
    }

    public void setSubscriptionPaymentId(UUID subscriptionPaymentId) {
        this.subscriptionPaymentId = subscriptionPaymentId;
    }

    public UUID getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(UUID subscriptionId) {
        this.subscriptionId = subscriptionId;
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

    public String getResponsePayload() {
        return responsePayload;
    }

    public void setResponsePayload(String responsePayload) {
        this.responsePayload = responsePayload;
    }

    public String getWebhookPayload() {
        return webhookPayload;
    }

    public void setWebhookPayload(String webhookPayload) {
        this.webhookPayload = webhookPayload;
    }

    public boolean isWebhookStatus() {
        return webhookStatus;
    }

    public void setWebhookStatus(boolean webhookStatus) {
        this.webhookStatus = webhookStatus;
    }

    public boolean isSignatureVerified() {
        return signatureVerified;
    }

    public void setSignatureVerified(boolean signatureVerified) {
        this.signatureVerified = signatureVerified;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }
}
