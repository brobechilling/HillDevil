package com.example.backend.service;

import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.entities.*;
import com.example.backend.entities.Package;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.SubscriptionPaymentMapper;
import com.example.backend.repository.SubscriptionPaymentRepository;
import com.example.backend.repository.SubscriptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class SubscriptionPaymentService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final PayOSService payOSService;
    private final SubscriptionPaymentMapper subscriptionPaymentMapper;
    private final ObjectMapper objectMapper;

    public SubscriptionPaymentService(
            SubscriptionRepository subscriptionRepository,
            SubscriptionPaymentRepository subscriptionPaymentRepository,
            PayOSService payOSService,
            SubscriptionPaymentMapper subscriptionPaymentMapper,
            ObjectMapper objectMapper
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionPaymentRepository = subscriptionPaymentRepository;
        this.payOSService = payOSService;
        this.subscriptionPaymentMapper = subscriptionPaymentMapper;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public SubscriptionPaymentResponse createPayment(UUID subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        Package pkg = subscription.getaPackage();
        if (pkg == null) throw new AppException(ErrorCode.PACKAGE_NOTEXISTED);

        Integer amount = pkg.getPrice();
        String itemName = pkg.getName();
        String description = "Pay " + pkg.getName();

        // ✅ Giới hạn 25 ký tự + thêm suffix "..."
        if (description.length() > 25) {
            description = description.substring(0, 22) + "...";
        }

        long orderCode = Math.abs(UUID.randomUUID().getMostSignificantBits() % 1_000_000_000L);
        if (subscriptionPaymentRepository.existsByPayOsOrderCode(orderCode)) {
            throw new AppException(ErrorCode.ORDER_CODE_EXISTS);
        }

        String dynamicReturnUrl = payOSService.buildReturnUrl(orderCode);

        CheckoutResponseData payResponse = payOSService.createVQRPayment(amount, orderCode, itemName, description, dynamicReturnUrl);

        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setSubscription(subscription);
        payment.setAmount(amount);
        payment.setPayOsOrderCode(orderCode);
        payment.setQrCodeUrl(payResponse.getQrCode());
        payment.setAccountNumber(payResponse.getAccountNumber());
        payment.setAccountName(payResponse.getAccountName());
        Long expiredAt = payResponse.getExpiredAt();
        if (expiredAt != null) {
            payment.setExpiredAt(Instant.ofEpochMilli(expiredAt * 1000)); // PayOS trả seconds → convert millis
        } else {
            payment.setExpiredAt(Instant.now().plusSeconds(30 * 60));
        }
        payment.setSubscriptionPaymentStatus(SubscriptionPaymentStatus.PENDING);
        payment.setDate(Instant.now());
        payment.setDescription(description);

        try {
            payment.setResponsePayload(objectMapper.writeValueAsString(payResponse));
        } catch (Exception e) {
            payment.setResponsePayload(payResponse.toString());
        }

        subscriptionPaymentRepository.save(payment);
        subscription.setStatus(SubscriptionStatus.PENDING_PAYMENT);
        subscriptionRepository.save(subscription);

        // ✅ Đảm bảo nhà hàng bị khóa cho đến khi thanh toán xong
        Restaurant restaurant = subscription.getRestaurant();
        if (restaurant != null) {
            restaurant.setStatus(false);
        }

        return subscriptionPaymentMapper.toSubscriptionPaymentResponse(payment);
    }

    @Transactional
    public void handlePaymentWebhook(Webhook webhookBody) {
        try {
            WebhookData data = payOSService.verifyWebhook(webhookBody);
            long orderCode = data.getOrderCode();
            if (orderCode == 0) return;

            SubscriptionPayment payment = subscriptionPaymentRepository.findByPayOsOrderCode(orderCode)
                    .orElse(null);
            if (payment == null) return;

            payment.setWebhookStatus(true);
            payment.setSignatureVerified(true);
            payment.setPayOsTransactionCode(data.getReference());
            payment.setWebhookPayload(objectMapper.writeValueAsString(webhookBody));

            Subscription subscription = payment.getSubscription();
            Restaurant restaurant = subscription.getRestaurant();

            if ("00".equals(data.getCode())) {
                // ✅ success
                payment.setSubscriptionPaymentStatus(SubscriptionPaymentStatus.SUCCESS);
                activateSubscription(subscription);
                if (restaurant != null) restaurant.setStatus(true);
            } else {
                // ✅ failed
                payment.setSubscriptionPaymentStatus(SubscriptionPaymentStatus.FAILED);
                cancelSubscription(subscription);
                if (restaurant != null) restaurant.setStatus(false);
            }

            subscriptionPaymentRepository.save(payment);
        } catch (Exception e) {
            throw new AppException(ErrorCode.PAYMENT_WEBHOOK_FAILED);
        }
    }

    public SubscriptionPaymentResponse getPaymentStatus(Long orderCode) {
        var payment = subscriptionPaymentRepository.findByPayOsOrderCode(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        return subscriptionPaymentMapper.toSubscriptionPaymentResponse(payment);
    }

    @Transactional
    public SubscriptionPaymentResponse cancelPayment(Long orderCode) {
        SubscriptionPayment payment = subscriptionPaymentRepository.findByPayOsOrderCode(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getSubscriptionPaymentStatus() != SubscriptionPaymentStatus.PENDING) {
            throw new AppException(ErrorCode.PAYMENT_CANNOT_CANCEL);
        }

        payment.setSubscriptionPaymentStatus(SubscriptionPaymentStatus.CANCELED);
        cancelSubscription(payment.getSubscription());
        subscriptionPaymentRepository.save(payment);

        return subscriptionPaymentMapper.toSubscriptionPaymentResponse(payment);
    }

    private void activateSubscription(Subscription subscription) {
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(subscription.getStartDate()
                .plusMonths(subscription.getaPackage().getBillingPeriod()));
        subscriptionRepository.save(subscription);
    }

    private void cancelSubscription(Subscription subscription) {
        subscription.setStatus(SubscriptionStatus.CANCELED);
        subscriptionRepository.save(subscription);
    }
}
