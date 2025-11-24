package com.example.backend.service;

import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.entities.Package;

import java.util.UUID;

@Service
public class SubscriptionLookupService {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionLookupService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional(readOnly = true)
    public Package getActivePackageByRestaurant(UUID restaurantId) {
        return subscriptionRepository.findActivePackageByRestaurantId(restaurantId)
                .orElseThrow(() -> new AppException(ErrorCode.SUBSCRIPTION_NOT_ACTIVE));
    }
}