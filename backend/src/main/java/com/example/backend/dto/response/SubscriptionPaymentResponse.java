package com.example.backend.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class SubscriptionPaymentResponse {
    private UUID subscriptionPaymentId;
    private BigDecimal amount;
    private String payOsOrderCode;
    private String payOsTransactionCode;
    private String qrCodeUrl;
    private String accountNumber;
    private String accountName;
    private Instant expiredAt;
    private String description;
    private String subscriptionPaymentStatus;
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

    public String getQrCodeUrl() {
        return qrCodeUrl;
    }

    public void setQrCodeUrl(String qrCodeUrl) {
        this.qrCodeUrl = qrCodeUrl;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public Instant getExpiredAt() {
        return expiredAt;
    }

    public void setExpiredAt(Instant expiredAt) {
        this.expiredAt = expiredAt;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSubscriptionPaymentStatus() {
        return subscriptionPaymentStatus;
    }

    public void setSubscriptionPaymentStatus(String subscriptionPaymentStatus) {
        this.subscriptionPaymentStatus = subscriptionPaymentStatus;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }
}
