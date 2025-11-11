package com.example.backend.service;

import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.entities.Restaurant;
import com.example.backend.entities.Subscription;
import com.example.backend.entities.SubscriptionPayment;
import com.example.backend.entities.SubscriptionPaymentStatus;
import com.example.backend.entities.Package;
import com.example.backend.entities.SubscriptionStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.repository.PackageRepository;
import com.example.backend.repository.SubscriptionRepository;
import com.example.backend.repository.SubscriptionPaymentRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class RestaurantSubscriptionService {

    private final RestaurantService restaurantService;
    private final SubscriptionService subscriptionService;
    private final SubscriptionPaymentService subscriptionPaymentService;
    private final SubscriptionRepository subscriptionRepository;
    private final PackageRepository packageRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;

    public RestaurantSubscriptionService(RestaurantService restaurantService,
            SubscriptionService subscriptionService,
            SubscriptionPaymentService subscriptionPaymentService,
            SubscriptionRepository subscriptionRepository,
            PackageRepository packageRepository,
            SubscriptionPaymentRepository subscriptionPaymentRepository) {
        this.restaurantService = restaurantService;
        this.subscriptionService = subscriptionService;
        this.subscriptionPaymentService = subscriptionPaymentService;
        this.subscriptionRepository = subscriptionRepository;
        this.packageRepository = packageRepository;
        this.subscriptionPaymentRepository = subscriptionPaymentRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public SubscriptionPaymentResponse createRestaurantWithSubscriptionAndPayment(
            RestaurantCreateRequest request, UUID packageId) {
        try {
            Restaurant restaurant = restaurantService.createEntity(request);

            Subscription subscription = subscriptionService.createEntitySubscription(restaurant, packageId);

            return subscriptionPaymentService.createPayment(subscription.getSubscriptionId());

        } catch (Exception e) {
            throw new AppException(ErrorCode.PAYMENT_CREATION_FAILED);
        }
    }

    @Transactional
    public SubscriptionPaymentResponse renewSubscription(UUID restaurantId, UUID packageId) {
        Subscription sub = subscriptionRepository.findTopByRestaurant_RestaurantIdOrderByCreatedAtDesc(restaurantId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        Package pack = packageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));

        // Update or keep same package
        if (!sub.getaPackage().getPackageId().equals(packageId)) {
            sub.setaPackage(pack);
        }

        sub.setStatus(SubscriptionStatus.PENDING_PAYMENT);
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);

        SubscriptionPaymentResponse paymentResponse = subscriptionPaymentService.createPayment(sub.getSubscriptionId());

        return paymentResponse;
    }

    @Transactional
    public SubscriptionPaymentResponse changePackage(UUID restaurantId, UUID newPackageId) {
        Subscription current = subscriptionRepository.findTopByRestaurant_RestaurantIdOrderByCreatedAtDesc(restaurantId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        if (current.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new AppException(ErrorCode.SUBSCRIPTION_NOT_ACTIVE);
        }

        current.setStatus(SubscriptionStatus.CANCELED);
        current.setEndDate(LocalDate.now());
        subscriptionRepository.save(current);

        Package newPack = packageRepository.findById(newPackageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));

        Subscription newSub = new Subscription();
        newSub.setRestaurant(current.getRestaurant());
        newSub.setaPackage(newPack);
        newSub.setStatus(SubscriptionStatus.PENDING_PAYMENT);
        newSub.setCreatedAt(Instant.now());
        newSub.setStartDate(LocalDate.now());
        newSub.setEndDate(LocalDate.now().plusMonths(newPack.getBillingPeriod()));
        subscriptionRepository.save(newSub);

        return subscriptionPaymentService.createPayment(newSub.getSubscriptionId());
    }
}
