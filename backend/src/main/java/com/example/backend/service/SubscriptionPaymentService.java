package com.example.backend.service;

import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.entities.Package;
import com.example.backend.entities.Subscription;
import com.example.backend.entities.SubscriptionPayment;
import com.example.backend.entities.SubscriptionStatus;
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

import java.math.BigDecimal;
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
        if (pkg == null) {
            throw new AppException(ErrorCode.PACKAGE_NOTEXISTED);
        }

        BigDecimal amount = pkg.getPrice();
        String itemName = pkg.getName();
        String description = ("Pay " + pkg.getName());
        if (description.length() > 25) description = description.substring(0, 25);

        long orderCode = System.currentTimeMillis() % 100_000_000;

        CheckoutResponseData checkout = payOSService.createPaymentLink(
                amount,
                orderCode,
                itemName,
                1,
                description
        );

        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setSubscription(subscription);
        payment.setAmount(amount);
        payment.setPayOsOrderCode(orderCode);
        payment.setPaymentStatus("PENDING");
        payment.setDate(Instant.now());
        payment.setCheckoutUrl(checkout.getCheckoutUrl());

        try {
            payment.setResponsePayload(objectMapper.writeValueAsString(checkout));
        } catch (Exception e) {
            payment.setResponsePayload(checkout.toString());
        }

        subscriptionPaymentRepository.save(payment);
        subscription.setStatus(SubscriptionStatus.PENDING_PAYMENT);
        subscriptionRepository.save(subscription);

        return subscriptionPaymentMapper.toSubscriptionPaymentResponse(payment);
    }

    @Transactional
    public void handlePaymentWebhook(Webhook webhookBody) {
        try {
            WebhookData webhookData = payOSService.verifyWebhook(webhookBody);

            long orderCode = webhookData.getOrderCode();
            String code = webhookData.getCode();

            if (orderCode == 0) {
                System.out.println("⚙️ Received test webhook from PayOS, skipping DB lookup.");
                return;
            }

            SubscriptionPayment payment = subscriptionPaymentRepository
                    .findByPayOsOrderCode(orderCode)
                    .orElse(null);

            if (payment == null) {
                System.out.println("⚠️ Webhook received for unknown orderCode: " + orderCode);
                return;
            }

            payment.setWebhookPayload(webhookBody.toString());
            payment.setSignatureVerified(true);
            payment.setPayOsTransactionCode(webhookData.getReference());

            if ("00".equals(code)) {
                payment.setPaymentStatus("SUCCESS");
                activateSubscription(payment.getSubscription());
            } else {
                payment.setPaymentStatus("FAILED");
                cancelSubscription(payment.getSubscription());
            }

            subscriptionPaymentRepository.save(payment);

        } catch (Exception e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.PAYMENT_WEBHOOK_FAILED);
        }
    }

    private void activateSubscription(Subscription subscription) {
        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setStartDate(LocalDate.now());
            subscription.setEndDate(
                    subscription.getStartDate().plusMonths(subscription.getaPackage().getBillingPeriod())
            );
            subscriptionRepository.save(subscription);
        }
    }

    private void cancelSubscription(Subscription subscription) {
        if (subscription.getStatus() != SubscriptionStatus.CANCELED) {
            subscription.setStatus(SubscriptionStatus.CANCELED);
            subscriptionRepository.save(subscription);
        }
    }
}
