package com.example.backend.service;

import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.dto.response.SubscriptionResponse;
import com.example.backend.entities.*;
import com.example.backend.entities.Package;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.PackageRepository;
import com.example.backend.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PackageRepository packageRepository;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            PackageRepository packageRepository
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.packageRepository = packageRepository;
    }

    @Transactional
    public Subscription createEntitySubscription(Restaurant restaurant, UUID packageId) {
        Package pack = packageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));

        Subscription subscription = new Subscription();
        subscription.setRestaurant(restaurant);
        subscription.setaPackage(pack);
        subscription.setStatus(SubscriptionStatus.PENDING_PAYMENT);
        subscription.setCreatedAt(Instant.now());

        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public SubscriptionResponse activateSubscription(UUID subscriptionId, int durationMonths) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        LocalDate start = LocalDate.now();
        LocalDate end = start.plusMonths(Math.max(1, durationMonths));

        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(start);
        subscription.setEndDate(end);
        subscription.setUpdatedAt(Instant.now());

        Subscription updated = subscriptionRepository.save(subscription);
        return mapToResponse(updated);
    }

    @Transactional
    public SubscriptionResponse renewSubscription(UUID subscriptionId, int additionalMonths) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new AppException(ErrorCode.SUBSCRIPTION_NOT_ACTIVE);
        }

        LocalDate now = LocalDate.now();
        LocalDate newEnd = (subscription.getEndDate() != null && subscription.getEndDate().isAfter(now))
                ? subscription.getEndDate().plusMonths(additionalMonths)
                : now.plusMonths(additionalMonths);

        subscription.setEndDate(newEnd);
        subscription.setUpdatedAt(Instant.now());

        Subscription updated = subscriptionRepository.save(subscription);
        return mapToResponse(updated);
    }

    public SubscriptionResponse getById(UUID id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        return mapToResponse(subscription);
    }

    // Helper method: map Subscription -> SubscriptionResponse
    private SubscriptionResponse mapToResponse(Subscription subscription) {
        SubscriptionResponse response = new SubscriptionResponse();
        response.setSubscriptionId(subscription.getSubscriptionId());
        response.setRestaurantId(subscription.getRestaurant() != null ? subscription.getRestaurant().getRestaurantId() : null);
        response.setPackageId(subscription.getaPackage() != null ? subscription.getaPackage().getPackageId() : null);
        response.setStatus(subscription.getStatus());
        response.setStartDate(subscription.getStartDate());
        response.setEndDate(subscription.getEndDate());

        // get lastest payment by using helper from entity, so cannot use default mapstruct
        SubscriptionPayment latestPayment = subscription.getLatestPayment();
        if (latestPayment != null) {
            SubscriptionPaymentResponse paymentInfo = new SubscriptionPaymentResponse();
            paymentInfo.setSubscriptionPaymentId(latestPayment.getSubscriptionPaymentId());
            paymentInfo.setAmount(BigDecimal.valueOf(latestPayment.getAmount()));
            paymentInfo.setPayOsOrderCode(String.valueOf(latestPayment.getPayOsOrderCode()));
            paymentInfo.setPayOsTransactionCode(latestPayment.getPayOsTransactionCode());
            paymentInfo.setQrCodeUrl(latestPayment.getQrCodeUrl());
            paymentInfo.setAccountNumber(latestPayment.getAccountNumber());
            paymentInfo.setAccountName(latestPayment.getAccountName());
            paymentInfo.setExpiredAt(latestPayment.getExpiredAt());
            paymentInfo.setDescription(latestPayment.getDescription());
            paymentInfo.setSubscriptionPaymentStatus(
                    latestPayment.getSubscriptionPaymentStatus() != null
                            ? latestPayment.getSubscriptionPaymentStatus().name()
                            : null
            );
            paymentInfo.setDate(latestPayment.getDate());
            response.setPaymentInfo(paymentInfo);
            response.setPaymentStatus(paymentInfo.getSubscriptionPaymentStatus());
            response.setAmount(paymentInfo.getAmount());
        }

        return response;
    }
}
