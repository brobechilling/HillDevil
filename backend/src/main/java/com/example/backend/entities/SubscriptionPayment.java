package com.example.backend.entities;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;

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

    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "payos_order_code")
    private Long payOsOrderCode;

    @Column(name = "payos_transaction_code")
    private String payOsTransactionCode;

    @Column(name = "checkout_url")
    private String checkoutUrl;

    @Column(name = "payment_status")
    private String paymentStatus;

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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
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
