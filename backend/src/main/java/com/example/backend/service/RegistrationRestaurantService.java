package com.example.backend.service;

import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.entities.Restaurant;
import com.example.backend.entities.Subscription;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class RegistrationRestaurantService {

    private final RestaurantService restaurantService;
    private final SubscriptionService subscriptionService;
    private final SubscriptionPaymentService subscriptionPaymentService;

    public RegistrationRestaurantService(RestaurantService restaurantService,
                                         SubscriptionService subscriptionService,
                                         SubscriptionPaymentService subscriptionPaymentService) {
        this.restaurantService = restaurantService;
        this.subscriptionService = subscriptionService;
        this.subscriptionPaymentService = subscriptionPaymentService;
    }
    @Transactional(rollbackFor = Exception.class)
    public SubscriptionPaymentResponse createRestaurantWithSubscriptionAndPayment(
            RestaurantCreateRequest request, UUID packageId
    ) {
        try {
            Restaurant restaurant = restaurantService.createEntity(request);

            Subscription subscription = subscriptionService.createEntitySubscription(restaurant, packageId);

            return subscriptionPaymentService.createPayment(subscription.getSubscriptionId());

        } catch (Exception e) {
            throw new AppException(ErrorCode.PAYMENT_CREATION_FAILED);
        }
    }
}
