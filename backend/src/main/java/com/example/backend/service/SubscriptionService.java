package com.example.backend.service;

import com.example.backend.dto.RestaurantSubscriptionOverviewDTO;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.dto.response.SubscriptionResponse;
import com.example.backend.entities.*;
import com.example.backend.entities.Package;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.PackageRepository;
import com.example.backend.repository.RestaurantRepository;
import com.example.backend.repository.SubscriptionPaymentRepository;
import com.example.backend.repository.SubscriptionRepository;
import com.example.backend.utils.SecurityUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PackageRepository packageRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final RestaurantRepository restaurantRepository;
    private final SecurityUtil securityUtil;
    private final Logger logger = LoggerFactory.getLogger(SubscriptionService.class);

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            PackageRepository packageRepository,
            SubscriptionPaymentRepository subscriptionPaymentRepository,
            RestaurantRepository restaurantRepository,
            SecurityUtil securityUtil
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.packageRepository = packageRepository;
        this.subscriptionPaymentRepository = subscriptionPaymentRepository;
        this.restaurantRepository = restaurantRepository;
        this.securityUtil = securityUtil;
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

    public SubscriptionResponse getById(UUID id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        return mapToResponse(subscription);
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

    @Transactional
    public SubscriptionResponse cancelSubscription(UUID subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        Restaurant res = subscription.getRestaurant();
        if (res != null) {
            res.setStatus(false);
            restaurantRepository.save(res);
        }

        if (subscription.getStatus() == SubscriptionStatus.CANCELED) {
            throw new AppException(ErrorCode.SUBSCRIPTION_ALREADY_CANCELLED);
        }

        subscription.setStatus(SubscriptionStatus.CANCELED);
        subscription.setUpdatedAt(Instant.now());
        Subscription saved = subscriptionRepository.save(subscription);
        return mapToResponse(saved);
    }

    @Transactional
    public SubscriptionResponse changePackage(UUID restaurantId, UUID newPackageId) {
        Subscription current = subscriptionRepository
                .findTopByRestaurant_RestaurantIdOrderByCreatedAtDesc(restaurantId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        if (current.getStatus() == SubscriptionStatus.ACTIVE) {
            current.setStatus(SubscriptionStatus.CANCELED);
            subscriptionRepository.save(current);
        }

        Restaurant restaurant = current.getRestaurant();
        Subscription created = createEntitySubscription(restaurant, newPackageId);
        return mapToResponse(created);
    }

    // -------------------------
    // Admin queries
    // -------------------------
    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getActiveSubscriptions() {
        return subscriptionRepository.findAllByStatus(SubscriptionStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubscriptionResponse getActiveSubscriptionByRestaurant(UUID restaurantId) {
        return subscriptionRepository
                .findTopByRestaurant_RestaurantIdAndStatusOrderByCreatedAtDesc(restaurantId, SubscriptionStatus.ACTIVE)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getPackagePurchaseStats() {
        List<Subscription> allSubs = subscriptionRepository.findAll();
        return allSubs.stream()
                .filter(s -> s.getaPackage() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getaPackage().getName(),
                        Collectors.counting()
                ));
    }

    // -------------------------
    // Payment queries
    // -------------------------
    @Transactional(readOnly = true)
    public SubscriptionPaymentResponse getLatestPaymentStatusForRestaurant(UUID restaurantId) {
        Optional<Subscription> latestSubscription = subscriptionRepository
                .findTopByRestaurant_RestaurantIdOrderByCreatedAtDesc(restaurantId);

        if (latestSubscription.isEmpty()) {
            return null;
        }
        return subscriptionPaymentToResponse(latestSubscription.get().getLatestPayment());
    }

    @Transactional(readOnly = true)
    public List<SubscriptionPaymentResponse> getPaymentHistoryByRestaurant(UUID restaurantId) {
        return subscriptionPaymentRepository
                .findAllBySubscription_Restaurant_RestaurantIdOrderByDateDesc(restaurantId)
                .stream()
                .map(this::subscriptionPaymentToResponse)
                .collect(Collectors.toList());
    }

    // -------------------------
    // Owner queries (grouped by restaurant)
    // -------------------------
    @Transactional(readOnly = true)
    public List<RestaurantSubscriptionOverviewDTO> getSubscriptionsOverviewForOwner() {
        User currentUser = securityUtil.getCurrentUser(); // implement this according to your security

        List<Restaurant> restaurants = restaurantRepository.findAllByUser_UserId(currentUser.getUserId());
        List<RestaurantSubscriptionOverviewDTO> overviewList = new ArrayList<>();

        for (Restaurant restaurant : restaurants) {
            RestaurantSubscriptionOverviewDTO overview = new RestaurantSubscriptionOverviewDTO();
            overview.setRestaurantId(restaurant.getRestaurantId());
            overview.setRestaurantName(restaurant.getName());

            // current active subscription for this restaurant
            SubscriptionResponse currentSub = subscriptionRepository
                    .findTopByRestaurant_RestaurantIdAndStatusOrderByCreatedAtDesc(
                            restaurant.getRestaurantId(), SubscriptionStatus.ACTIVE)
                    .map(this::mapToResponse)
                    .orElse(null);
            overview.setCurrentSubscription(currentSub);

            // payment history for this restaurant
            List<SubscriptionPaymentResponse> paymentHistory = subscriptionPaymentRepository
                    .findAllBySubscription_Restaurant_RestaurantIdOrderByDateDesc(restaurant.getRestaurantId())
                    .stream()
                    .map(this::subscriptionPaymentToResponse)
                    .collect(Collectors.toList());
            overview.setPaymentHistory(paymentHistory);

            overviewList.add(overview);
        }

        return overviewList;
    }

    // -------------------------
    // Scheduled
    // -------------------------
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void expireOldSubscriptions() {
        List<Subscription> subs = subscriptionRepository.findAllByStatus(SubscriptionStatus.ACTIVE);
        LocalDate today = LocalDate.now();
        logger.info("Auto expiring {} subscriptions", subs.size());
        for (Subscription s : subs) {
            if (s.getEndDate() != null && s.getEndDate().isBefore(today)) {
                s.setStatus(SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(s);
            }
        }
    }

    // -------------------------
    // Helpers / mapping
    // -------------------------
    private SubscriptionResponse mapToResponse(Subscription subscription) {
        if (subscription == null) return null;
        SubscriptionResponse response = new SubscriptionResponse();
        response.setSubscriptionId(subscription.getSubscriptionId());
        response.setRestaurantId(subscription.getRestaurant() != null ? subscription.getRestaurant().getRestaurantId() : null);
        response.setPackageId(subscription.getaPackage() != null ? subscription.getaPackage().getPackageId() : null);
        response.setStatus(subscription.getStatus());
        response.setStartDate(subscription.getStartDate());
        response.setEndDate(subscription.getEndDate());

        SubscriptionPayment latestPayment = subscription.getLatestPayment();
        if (latestPayment != null) {
            response.setPaymentInfo(subscriptionPaymentToResponse(latestPayment));
            response.setPaymentStatus(latestPayment.getSubscriptionPaymentStatus() != null ? latestPayment.getSubscriptionPaymentStatus().name() : null);
            response.setAmount(BigDecimal.valueOf(latestPayment.getAmount()));
        }
        return response;
    }

    private SubscriptionPaymentResponse subscriptionPaymentToResponse(SubscriptionPayment payment) {
        if (payment == null) return null;
        SubscriptionPaymentResponse dto = new SubscriptionPaymentResponse();
        dto.setSubscriptionPaymentId(payment.getSubscriptionPaymentId());
        dto.setAmount(BigDecimal.valueOf(payment.getAmount()));
        dto.setPayOsOrderCode(String.valueOf(payment.getPayOsOrderCode()));
        dto.setPayOsTransactionCode(payment.getPayOsTransactionCode());
        dto.setQrCodeUrl(payment.getQrCodeUrl());
        dto.setAccountNumber(payment.getAccountNumber());
        dto.setAccountName(payment.getAccountName());
        dto.setExpiredAt(payment.getExpiredAt());
        dto.setDescription(payment.getDescription());
        dto.setSubscriptionPaymentStatus(payment.getSubscriptionPaymentStatus() != null ? payment.getSubscriptionPaymentStatus().name() : null);
        dto.setDate(payment.getDate());
        return dto;
    }
}
