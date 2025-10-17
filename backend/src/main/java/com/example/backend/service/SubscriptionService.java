package com.example.backend.service;

import com.example.backend.dto.request.SubscriptionRequest;
import com.example.backend.dto.response.SubscriptionResponse;
import com.example.backend.entities.Package;
import com.example.backend.entities.Restaurant;
import com.example.backend.entities.Subscription;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.SubscriptionMapper;
import com.example.backend.repository.PackageRepository;
import com.example.backend.repository.RestaurantRepository;
import com.example.backend.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final RestaurantRepository restaurantRepository;
    private final PackageRepository packageRepository;
    private final SubscriptionMapper subscriptionMapper;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            RestaurantRepository restaurantRepository,
            PackageRepository packageRepository,
            SubscriptionMapper subscriptionMapper
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.restaurantRepository = restaurantRepository;
        this.packageRepository = packageRepository;
        this.subscriptionMapper = subscriptionMapper;
    }

    @Transactional
    public SubscriptionResponse createSubscription(SubscriptionRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));

        Package pack = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));

        Subscription subscription = subscriptionMapper.toSubscription(request);
        subscription.setRestaurant(restaurant);
        subscription.setaPackage(pack);
        subscription.setStatus(false);
        subscription.setCreatedAt(Instant.now());

        Subscription saved = subscriptionRepository.save(subscription);
        return subscriptionMapper.toSubscriptionResponse(saved);
    }

    @Transactional
    public SubscriptionResponse activateSubscription(UUID subscriptionId, int durationMonths) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        LocalDate start = LocalDate.now();
        LocalDate end = start.plusMonths(Math.max(1, durationMonths));

        subscription.setStatus(true);
        subscription.setStartDate(start);
        subscription.setEndDate(end);
        subscription.setUpdatedAt(Instant.now());

        Subscription updated = subscriptionRepository.save(subscription);
        return subscriptionMapper.toSubscriptionResponse(updated);
    }

    @Transactional
    public SubscriptionResponse renewSubscription(UUID subscriptionId, int additionalMonths) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));

        if (!subscription.isStatus()) {
            throw new AppException(ErrorCode.SUBSCRIPTION_NOT_ACTIVE);
        }

        LocalDate now = LocalDate.now();
        LocalDate start = (subscription.getEndDate() != null && subscription.getEndDate().isAfter(now))
                ? subscription.getStartDate()
                : now;

        LocalDate newEnd = (subscription.getEndDate() != null && subscription.getEndDate().isAfter(now))
                ? subscription.getEndDate().plusMonths(additionalMonths)
                : now.plusMonths(additionalMonths);

        subscription.setStartDate(start);
        subscription.setEndDate(newEnd);
        subscription.setUpdatedAt(Instant.now());

        Subscription updated = subscriptionRepository.save(subscription);
        return subscriptionMapper.toSubscriptionResponse(updated);
    }

    public SubscriptionResponse getById(UUID id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_FOUND));
        return subscriptionMapper.toSubscriptionResponse(subscription);
    }
}
