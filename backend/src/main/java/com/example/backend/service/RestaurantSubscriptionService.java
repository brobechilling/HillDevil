package com.example.backend.service;

import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.entities.*;
import com.example.backend.entities.Package;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.repository.SubscriptionRepository;

import java.util.UUID;

@Service
public class RestaurantSubscriptionService {

    private final RestaurantService restaurantService;
    private final SubscriptionService subscriptionService;
    private final SubscriptionPaymentService subscriptionPaymentService;
    private final SubscriptionRepository subscriptionRepository;

    public RestaurantSubscriptionService(RestaurantService restaurantService,
            SubscriptionService subscriptionService,
            SubscriptionPaymentService subscriptionPaymentService,
            SubscriptionRepository subscriptionRepository) {
        this.restaurantService = restaurantService;
        this.subscriptionService = subscriptionService;
        this.subscriptionPaymentService = subscriptionPaymentService;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public SubscriptionPaymentResponse createRestaurantWithSubscriptionAndPayment(
            RestaurantCreateRequest request, UUID packageId) {

        Restaurant restaurant = restaurantService.createEntity(request);

        Subscription subscription = subscriptionService.createEntitySubscription(restaurant, packageId);

        SubscriptionPaymentResponse payment = subscriptionPaymentService.createPayment(
                subscription.getSubscriptionId(),
                SubscriptionPaymentPurpose.NEW_SUBSCRIPTION,
                packageId);

        // attach restaurant info
        payment.setRestaurantId(restaurant.getRestaurantId());
        payment.setRestaurantName(restaurant.getName());

        return payment;
    }

    @Transactional
    public SubscriptionPaymentResponse renewSubscription(UUID restaurantId) {
        Subscription currentSubscription = subscriptionRepository
                .findTopByRestaurant_RestaurantIdAndStatusOrderByCreatedAtDesc(
                        restaurantId, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_ACTIVE));

        Package currentPackage = currentSubscription.getaPackage();
        if (currentPackage == null) {
            throw new AppException(ErrorCode.PACKAGE_NOTEXISTED);
        }

        UUID targetPackageId = currentPackage.getPackageId();

        SubscriptionPaymentResponse payment = subscriptionPaymentService.createPayment(
                currentSubscription.getSubscriptionId(),
                SubscriptionPaymentPurpose.RENEW,
                targetPackageId);

        // attach restaurant info
        Restaurant restaurant = currentSubscription.getRestaurant();
        payment.setRestaurantId(restaurant.getRestaurantId());
        payment.setRestaurantName(restaurant.getName());

        return payment;
    }

    @Transactional
    public SubscriptionPaymentResponse upgradePackage(UUID restaurantId, UUID newPackageId) {
        Subscription current = getLatestSubscription(restaurantId);

        if (current.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new AppException(ErrorCode.SUBSCRIPTION_NOT_ACTIVE);
        }

        SubscriptionPaymentResponse payment = subscriptionPaymentService.createPayment(
                current.getSubscriptionId(),
                SubscriptionPaymentPurpose.UPGRADE,
                newPackageId);

        Restaurant restaurant = current.getRestaurant();
        payment.setRestaurantId(restaurant.getRestaurantId());
        payment.setRestaurantName(restaurant.getName());

        return payment;
    }

    private Subscription getLatestSubscription(UUID restaurantId) {
        return subscriptionRepository.findTopByRestaurant_RestaurantIdOrderByCreatedAtDesc(restaurantId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
    }
}
