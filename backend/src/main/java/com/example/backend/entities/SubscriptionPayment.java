package com.example.backend.entities;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subscription_payment")
public class SubscriptionPayment {

    @Id
    @Column(name = "subscription_payment_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID subscriptionPaymentId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "subscription_id")
    private Subscription subscription;

    @Column(name = "amount", nullable = false)
    private Integer amount = 0;

    @Column(name = "payos_order_code")
    private Long payOsOrderCode;

    @Column(name = "payos_transaction_code")
    private String payOsTransactionCode;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "account_name")
    private String accountName;

    @Column(name = "expired_at")
    private Instant expiredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_payment_status")
    private SubscriptionPaymentStatus subscriptionPaymentStatus;;

    @Lob
    @Column(name = "response_payload")
    private String responsePayload;

    @Lob
    @Column(name = "webhook_payload")
    private String webhookPayload;

    @Column(name = "webhook_status")
    private boolean webhookStatus;

    @Column(name = "is_signature_verified")
    private boolean isSignatureVerified;

    @Column(name = "date")
    private Instant date;

    @Column(name = "description")
    private String description;

    public SubscriptionPaymentStatus getSubscriptionPaymentStatus() {
        return subscriptionPaymentStatus;
    }

    public void setSubscriptionPaymentStatus(SubscriptionPaymentStatus subscriptionPaymentStatus) {
        this.subscriptionPaymentStatus = subscriptionPaymentStatus;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UUID getSubscriptionPaymentId() {
        return subscriptionPaymentId;
    }

    public void setSubscriptionPaymentId(UUID subscriptionPaymentId) {
        this.subscriptionPaymentId = subscriptionPaymentId;
    }

    public Subscription getSubscription() {
        return subscription;
    }

    public void setSubscription(Subscription subscription) {
        this.subscription = subscription;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public Long getPayOsOrderCode() {
        return payOsOrderCode;
    }

    public void setPayOsOrderCode(Long payOsOrderCode) {
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
        return isSignatureVerified;
    }

    public void setSignatureVerified(boolean isSignatureVerified) {
        this.isSignatureVerified = isSignatureVerified;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }
}
