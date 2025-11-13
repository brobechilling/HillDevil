package com.example.backend.service;

import com.example.backend.dto.TopSpenderDTO;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.entities.*;
import com.example.backend.entities.Package;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.SubscriptionPaymentMapper;
import com.example.backend.repository.PackageRepository;
import com.example.backend.repository.RestaurantRepository;
import com.example.backend.repository.SubscriptionPaymentRepository;
import com.example.backend.repository.SubscriptionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.List;

@Service
public class SubscriptionPaymentService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final PayOSService payOSService;
    private final SubscriptionPaymentMapper subscriptionPaymentMapper;
    private final ObjectMapper objectMapper;
    private final PackageRepository packageRepository;
    private final RestaurantRepository restaurantRepository;

    public SubscriptionPaymentService(
            SubscriptionRepository subscriptionRepository,
            SubscriptionPaymentRepository subscriptionPaymentRepository,
            PayOSService payOSService,
            SubscriptionPaymentMapper subscriptionPaymentMapper,
            ObjectMapper objectMapper,
            PackageRepository packageRepository,
            RestaurantRepository restaurantRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionPaymentRepository = subscriptionPaymentRepository;
        this.payOSService = payOSService;
        this.subscriptionPaymentMapper = subscriptionPaymentMapper;
        this.objectMapper = objectMapper;
        this.packageRepository = packageRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Transactional
    public SubscriptionPaymentResponse createPayment(
            UUID subscriptionId,
            SubscriptionPaymentPurpose purpose,
            UUID targetPackageId) {  // Thêm targetPackageId

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        // Hủy các payment pending cũ
        subscriptionPaymentRepository.findAllBySubscription_SubscriptionId(subscriptionId)
                .stream()
                .filter(p -> p.getSubscriptionPaymentStatus() == SubscriptionPaymentStatus.PENDING)
                .forEach(p -> {
                    p.setSubscriptionPaymentStatus(SubscriptionPaymentStatus.CANCELED);
                    subscriptionPaymentRepository.save(p);
                });

        Package currentPackage = subscription.getaPackage();
        Package targetPackage = packageRepository.findById(targetPackageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));

        int amountToPay;
        String description;

        if (purpose == SubscriptionPaymentPurpose.UPGRADE) {
            if (subscription.getStatus() != SubscriptionStatus.ACTIVE || subscription.getEndDate() == null) {
                throw new AppException(ErrorCode.SUBSCRIPTION_NOT_ACTIVE);
            }
            amountToPay = calculateProratedUpgradeAmount(subscription, targetPackage);
            description = "Upgrade package: " + currentPackage.getName() + " → " + targetPackage.getName();
        } else {
            amountToPay = targetPackage.getPrice();
            description = purpose == SubscriptionPaymentPurpose.NEW_SUBSCRIPTION
                    ? "Register new package " + targetPackage.getName()
                    : "Renew package " + targetPackage.getName();
        }

        if (description.length() > 25) description = description.substring(0, 22) + "...";

        long orderCode = generateUniqueOrderCode();

        String returnUrl = payOSService.buildReturnUrl(orderCode);
        CreatePaymentLinkResponse payResponse = payOSService.createVQRPayment(
                (long) amountToPay, orderCode, description, returnUrl);

        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setSubscription(subscription);
        payment.setAmount(amountToPay);
        payment.setProratedAmount(purpose == SubscriptionPaymentPurpose.UPGRADE ? amountToPay : null);
        payment.setTargetPackage(targetPackage);
        payment.setPurpose(purpose);
        payment.setPayOsOrderCode(orderCode);
        payment.setQrCodeUrl(payResponse.getQrCode());
        payment.setAccountNumber(payResponse.getAccountNumber());
        payment.setAccountName(payResponse.getAccountName());
        payment.setExpiredAt(payResponse.getExpiredAt() != null
                ? Instant.ofEpochMilli(payResponse.getExpiredAt() * 1000)
                : Instant.now().plusSeconds(30 * 60));
        payment.setSubscriptionPaymentStatus(SubscriptionPaymentStatus.PENDING);
        payment.setDate(Instant.now());
        payment.setDescription(description);

        try {
            payment.setResponsePayload(objectMapper.writeValueAsString(payResponse));
        } catch (Exception e) {
            payment.setResponsePayload(payResponse.toString());
        }

        subscriptionPaymentRepository.save(payment);

        if (purpose != SubscriptionPaymentPurpose.RENEW) {
            subscription.setStatus(SubscriptionStatus.PENDING_PAYMENT);
            subscriptionRepository.save(subscription);

            Restaurant restaurant = subscription.getRestaurant();
            if (restaurant != null) restaurant.setStatus(false);
        }

        return subscriptionPaymentMapper.toSubscriptionPaymentResponse(payment);
    }

    private int calculateProratedUpgradeAmount(Subscription subscription, Package newPackage) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = subscription.getEndDate();
        if (endDate == null || endDate.isBefore(today)) {
            throw new AppException(ErrorCode.SUBSCRIPTION_ALREADY_EXPIRED);
        }

        long totalDays = ChronoUnit.DAYS.between(subscription.getStartDate(), endDate);
        long remainingDays = ChronoUnit.DAYS.between(today, endDate);

        if (totalDays <= 0) return newPackage.getPrice();

        double usedRatio = (double) (totalDays - remainingDays) / totalDays;
        int oldPackageValue = subscription.getaPackage().getPrice();
        int credit = (int) Math.round(oldPackageValue * (1 - usedRatio));

        int newPrice = newPackage.getPrice();
        int amountToPay = Math.max(0, newPrice - credit);

        return amountToPay;
    }

    private long generateUniqueOrderCode() {
        long orderCode = System.currentTimeMillis() % 1_000_000_000L;
        while (subscriptionPaymentRepository.existsByPayOsOrderCode(orderCode)) {
            orderCode = (orderCode + 1) % 1_000_000_000L;
        }
        return orderCode;
    }

    @Transactional
    public void handlePaymentWebhook(Webhook webhookBody) {
        try {
            WebhookData data = payOSService.verifyWebhook(webhookBody);
            long orderCode = data.getOrderCode();
            if (orderCode == 0)
                return;

            SubscriptionPayment payment = subscriptionPaymentRepository.findByPayOsOrderCode(orderCode).orElse(null);
            if (payment == null)
                return;

            payment.setWebhookStatus(true);
            payment.setSignatureVerified(true);
            payment.setPayOsTransactionCode(data.getReference());
            payment.setWebhookPayload(objectMapper.writeValueAsString(webhookBody));

            Subscription subscription = payment.getSubscription();
            Restaurant restaurant = subscription.getRestaurant();

            if ("00".equals(data.getCode())) {
                payment.setSubscriptionPaymentStatus(SubscriptionPaymentStatus.SUCCESS);

                if (payment.getPurpose() == SubscriptionPaymentPurpose.UPGRADE) {
                    subscription.setaPackage(payment.getTargetPackage());
                    subscription.setStatus(SubscriptionStatus.ACTIVE);
                    subscription.setUpdatedAt(Instant.now());
                    subscriptionRepository.save(subscription);
                } else if (payment.getPurpose() == SubscriptionPaymentPurpose.NEW_SUBSCRIPTION) {
                    subscription.setStartDate(LocalDate.now());
                    subscription.setEndDate(LocalDate.now().plusMonths(payment.getTargetPackage().getBillingPeriod()));
                    subscription.setStatus(SubscriptionStatus.ACTIVE);
                    subscription.setUpdatedAt(Instant.now());
                    subscriptionRepository.save(subscription);
                } else if (payment.getPurpose() == SubscriptionPaymentPurpose.RENEW) {
                    LocalDate newEndDate = subscription.getEndDate() != null
                            ? subscription.getEndDate().plusMonths(payment.getTargetPackage().getBillingPeriod())
                            : LocalDate.now().plusMonths(payment.getTargetPackage().getBillingPeriod());
                    subscription.setEndDate(newEndDate);
                    subscription.setStatus(SubscriptionStatus.ACTIVE);
                    subscription.setUpdatedAt(Instant.now());
                    subscriptionRepository.save(subscription);
                }

                if (restaurant != null) {
                    restaurant.setStatus(true);
                    restaurantRepository.save(restaurant);
                }
            }

            subscriptionPaymentRepository.save(payment);

        } catch (Exception e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.PAYMENT_WEBHOOK_FAILED);
        }
    }

    @Transactional(readOnly = true)
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
        subscriptionPaymentRepository.save(payment);

        Subscription subscription = payment.getSubscription();

        if (payment.getPurpose() == SubscriptionPaymentPurpose.UPGRADE) {
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscriptionRepository.save(subscription);

            Restaurant restaurant = subscription.getRestaurant();
            if (restaurant != null) {
                restaurant.setStatus(true);
                restaurantRepository.save(restaurant);
            }
        }

        else if (payment.getPurpose() == SubscriptionPaymentPurpose.NEW_SUBSCRIPTION && subscription.getStartDate() == null) {
            subscription.setStatus(SubscriptionStatus.CANCELED);
            subscriptionRepository.save(subscription);
        }

        return subscriptionPaymentMapper.toSubscriptionPaymentResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<TopSpenderDTO> getTopSpenders(int limit) {
        List<Object[]> results = subscriptionPaymentRepository.findTopSpenders(limit);

        return results.stream().map(row -> {
            TopSpenderDTO dto = new TopSpenderDTO();
            dto.setUserId(UUID.fromString(row[0].toString()));
            dto.setUsername((String) row[1]);
            dto.setEmail((String) row[2]);
            dto.setTotalSpent(new BigDecimal(row[3].toString()));
            return dto;
        }).collect(Collectors.toList());
    }
}
