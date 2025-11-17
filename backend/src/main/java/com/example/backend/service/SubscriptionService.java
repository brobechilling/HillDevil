package com.example.backend.service;

import com.example.backend.dto.ActivePackageStatsDTO;
import com.example.backend.dto.CurrentSubscriptionOverviewDTO;
import com.example.backend.dto.RestaurantSubscriptionOverviewDTO;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.dto.response.SubscriptionResponse;
import com.example.backend.entities.*;
import com.example.backend.entities.Package;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.SubscriptionMailMapper;
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
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PackageRepository packageRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final RestaurantRepository restaurantRepository;
    private final SecurityUtil securityUtil;
    private final MailService mailService;
    private final SubscriptionMailMapper subscriptionMailMapper;
    private final Logger logger = LoggerFactory.getLogger(SubscriptionService.class);
    final long PAYMENT_TIMEOUT_MINUTES = 30;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            PackageRepository packageRepository,
            SubscriptionPaymentRepository subscriptionPaymentRepository,
            RestaurantRepository restaurantRepository,
            SecurityUtil securityUtil,
            MailService mailService,
            SubscriptionMailMapper subscriptionMailMapper) {
        this.subscriptionRepository = subscriptionRepository;
        this.packageRepository = packageRepository;
        this.subscriptionPaymentRepository = subscriptionPaymentRepository;
        this.restaurantRepository = restaurantRepository;
        this.securityUtil = securityUtil;
        this.mailService = mailService;
        this.subscriptionMailMapper = subscriptionMailMapper;
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
        User currentUser = securityUtil.getCurrentUser();
        List<Restaurant> restaurants = restaurantRepository.findAllByUser_UserId(currentUser.getUserId());

        return restaurants.stream().map(restaurant -> {
            RestaurantSubscriptionOverviewDTO overview = new RestaurantSubscriptionOverviewDTO();
            overview.setRestaurantId(restaurant.getRestaurantId());
            overview.setRestaurantName(restaurant.getName());

            Subscription currentSub = restaurant.getSubscriptions().stream()
                    .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE)
                    .max(Comparator.comparing(Subscription::getCreatedAt))
                    .orElse(null);

            overview.setCurrentSubscription(mapToCurrentSubscriptionOverview(currentSub));

            List<SubscriptionPaymentResponse> payments = restaurant.getSubscriptions().stream()
                    .flatMap(sub -> sub.getSubscriptionPayments().stream())
                    .sorted(Comparator.comparing(SubscriptionPayment::getDate).reversed())
                    .map(this::subscriptionPaymentToResponse)
                    .collect(Collectors.toList());

            overview.setPaymentHistory(payments);

            return overview;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<ActivePackageStatsDTO> getActivePackageStats() {
        List<Subscription> subs = subscriptionRepository.findAllWithPayments();

        Map<String, List<Subscription>> groupedByPackage = subs.stream()
                .collect(Collectors.groupingBy(s -> s.getaPackage().getName()));

        return groupedByPackage.entrySet().stream().map(entry -> {
            String packageName = entry.getKey();
            List<Subscription> packageSubs = entry.getValue();

            long activeCount = packageSubs.stream()
                    .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                    .count();

            // calculate payment count and total revenue (all payments with SUCCESS status
            // from all subscriptions, even canceled subscriptions)
            List<SubscriptionPayment> payments = packageSubs.stream()
                    .flatMap(s -> s.getSubscriptionPayments().stream())
                    .filter(p -> p.getSubscriptionPaymentStatus() == SubscriptionPaymentStatus.SUCCESS)
                    .toList();

            long paymentCount = payments.size();
            BigDecimal totalRevenue = payments.stream()
                    .map(p -> BigDecimal.valueOf(p.getAmount()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            ActivePackageStatsDTO dto = new ActivePackageStatsDTO();
            dto.setPackageName(packageName);
            dto.setActiveCount(activeCount);
            dto.setPaymentCount(paymentCount);
            dto.setTotalRevenue(totalRevenue);

            return dto;
        }).collect(Collectors.toList());
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

    @Scheduled(cron = "0 */5 * * * *") // every 5 minutes
    @Transactional
    public void cleanupUnpaidSubscriptions() {
        Instant cutoff = Instant.now().minus(PAYMENT_TIMEOUT_MINUTES, ChronoUnit.MINUTES);
        List<Subscription> pendingSubs = subscriptionRepository.findAllByStatus(SubscriptionStatus.PENDING_PAYMENT);

        logger.info("Cleaning up {} unpaid subscriptions older than {} minutes", pendingSubs.size(),
                PAYMENT_TIMEOUT_MINUTES);

        for (Subscription s : pendingSubs) {
            SubscriptionPayment payment = s.getLatestPayment();
            if (payment != null && payment.getDate() != null && payment.getDate().isBefore(cutoff)) {
                Restaurant r = s.getRestaurant();
                if (r != null && subscriptionRepository.countByRestaurant_RestaurantId(r.getRestaurantId()) <= 1) {
                    r.setStatus(false);
                    restaurantRepository.delete(r);
                }
                subscriptionRepository.delete(s);
            }
        }
    }

    @Scheduled(cron = "0 0 8 * * ?")
    public void sendSubscriptionReminders() {
        LocalDate today = LocalDate.now();
        LocalDate reminderDate = today.plusDays(3);
        List<Subscription> subscriptions = subscriptionRepository.findSubscriptionsExpiringBetween(today, reminderDate);

        subscriptions.stream()
                .map(subscriptionMailMapper::toReminderMailRequest)
                .forEach(mailService::sendSubscriptionReminderMail);
    }

    // -------------------------
    // Helpers / mapping
    // -------------------------
    private SubscriptionResponse mapToResponse(Subscription subscription) {
        if (subscription == null)
            return null;
        SubscriptionResponse response = new SubscriptionResponse();
        response.setSubscriptionId(subscription.getSubscriptionId());
        response.setRestaurantId(
                subscription.getRestaurant() != null ? subscription.getRestaurant().getRestaurantId() : null);
        response.setPackageId(subscription.getaPackage() != null ? subscription.getaPackage().getPackageId() : null);
        response.setStatus(subscription.getStatus());
        response.setStartDate(subscription.getStartDate());
        response.setEndDate(subscription.getEndDate());

        SubscriptionPayment latestPayment = subscription.getLatestPayment();
        if (latestPayment != null) {
            response.setPaymentInfo(subscriptionPaymentToResponse(latestPayment));
            response.setPaymentStatus(latestPayment.getSubscriptionPaymentStatus() != null
                    ? latestPayment.getSubscriptionPaymentStatus().name()
                    : null);
            response.setAmount(BigDecimal.valueOf(latestPayment.getAmount()));
        }
        return response;
    }

    private SubscriptionPaymentResponse subscriptionPaymentToResponse(SubscriptionPayment payment) {
        if (payment == null)
            return null;
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
        dto.setPurpose(payment.getPurpose());
        dto.setProratedAmount(payment.getProratedAmount());
        dto.setSubscriptionPaymentStatus(
                payment.getSubscriptionPaymentStatus() != null ? payment.getSubscriptionPaymentStatus().name() : null);
        dto.setDate(payment.getDate());
        return dto;
    }

    private CurrentSubscriptionOverviewDTO mapToCurrentSubscriptionOverview(Subscription subscription) {
        if (subscription == null)
            return null;
        CurrentSubscriptionOverviewDTO dto = new CurrentSubscriptionOverviewDTO();
        dto.setSubscriptionId(subscription.getSubscriptionId());
        dto.setPackageId(subscription.getaPackage() != null ? subscription.getaPackage().getPackageId() : null);
        dto.setStatus(subscription.getStatus());
        dto.setStartDate(subscription.getStartDate());
        dto.setEndDate(subscription.getEndDate());

        Package currentPackage = subscription.getaPackage();
        dto.setAmount(currentPackage != null ? BigDecimal.valueOf(currentPackage.getPrice()) : BigDecimal.ZERO);

        return dto;
    }
}
