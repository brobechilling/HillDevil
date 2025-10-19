package com.example.backend.service;

import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.entities.Subscription;
import com.example.backend.entities.SubscriptionPayment;
import com.example.backend.entities.SubscriptionStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.SubscriptionPaymentMapper;
import com.example.backend.repository.SubscriptionPaymentRepository;
import com.example.backend.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Service
public class SubscriptionPaymentService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final PayOSService payOSService;
    private final SubscriptionPaymentMapper subscriptionPaymentMapper;

    public SubscriptionPaymentService(
            SubscriptionRepository subscriptionRepository,
            SubscriptionPaymentRepository subscriptionPaymentRepository,
            PayOSService payOSService,
            SubscriptionPaymentMapper subscriptionPaymentMapper
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionPaymentRepository = subscriptionPaymentRepository;
        this.payOSService = payOSService;
        this.subscriptionPaymentMapper = subscriptionPaymentMapper;
    }

    @Transactional
    public SubscriptionPaymentResponse createPayment(UUID subscriptionId, BigDecimal amount) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        Long orderCode = System.currentTimeMillis(); // unique order code cho PayOS
        String description = "Thanh toán gói đăng ký cho nhà hàng";

        Map<String, Object> paymentData = payOSService.createPayment(amount, orderCode, description);

        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setSubscription(subscription);
        payment.setAmount(amount);
        payment.setPayOsOrderCode(orderCode);
        payment.setPaymentStatus("PENDING");
        payment.setDate(Instant.now());
        payment.setResponsePayload(paymentData.toString());

        Object checkoutUrlObj = paymentData.get("checkoutUrl");
        if (checkoutUrlObj != null) {
            payment.setCheckoutUrl(checkoutUrlObj.toString());
        }

        payment = subscriptionPaymentRepository.save(payment);

        subscription.setStatus(SubscriptionStatus.PENDING_PAYMENT);
        subscriptionRepository.save(subscription);

        return subscriptionPaymentMapper.toSubscriptionPaymentResponse(payment);
    }

    @Transactional
    public void handlePaymentSuccess(Long orderCode) {
        SubscriptionPayment payment = subscriptionPaymentRepository.findByPayOsOrderCode(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        payment.setPaymentStatus("SUCCESS");
        subscriptionPaymentRepository.save(payment);

        Subscription subscription = payment.getSubscription();
        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setStartDate(LocalDate.now());
            subscription.setEndDate(subscription.getStartDate().plusMonths(1));
            subscriptionRepository.save(subscription);
        }
    }
}
