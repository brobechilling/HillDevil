package com.example.backend.service;

import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.entities.Subscription;
import com.example.backend.entities.SubscriptionPayment;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.SubscriptionPaymentMapper;
import com.example.backend.repository.SubscriptionPaymentRepository;
import com.example.backend.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
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

        // Tạo orderCode dạng Long (PayOS yêu cầu dạng số)
        Long orderCode = System.currentTimeMillis(); // hoặc logic khác tùy bạn
        String description = "Thanh toán gói đăng ký cho nhà hàng";

        // Gọi PayOS API
        Map<String, Object> paymentData = payOSService.createPayment(amount, orderCode, description);

        // Lưu thông tin thanh toán
        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setSubscription(subscription);
        payment.setAmount(amount);
        payment.setPayOsOrderCode(orderCode);

        Object checkoutUrlObj = paymentData.get("checkoutUrl");
        if (checkoutUrlObj != null) {
            payment.setCheckoutUrl(String.valueOf(checkoutUrlObj));
        }

        payment.setPaymentStatus("PENDING");
        payment.setDate(Instant.now());
        payment.setResponsePayload(paymentData.toString()); // lưu log response để trace

        payment = subscriptionPaymentRepository.save(payment);
        return subscriptionPaymentMapper.toSubscriptionPaymentResponse(payment);
    }

    @Transactional
    public void handlePaymentSuccess(Long orderCode) {
        SubscriptionPayment payment = subscriptionPaymentRepository.findByPayOsOrderCode(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        payment.setPaymentStatus("SUCCESS");
        subscriptionPaymentRepository.save(payment);

        // Kích hoạt subscription
        Subscription subscription = payment.getSubscription();
        if (!subscription.isStatus()) {
            subscription.setStatus(true);
            subscription.setStartDate(Instant.now()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate());
            subscription.setEndDate(subscription.getStartDate().plusMonths(1));
            subscriptionRepository.save(subscription);
        }
    }
}
