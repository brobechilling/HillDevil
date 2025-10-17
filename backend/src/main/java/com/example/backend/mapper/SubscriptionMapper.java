package com.example.backend.mapper;

import com.example.backend.dto.request.SubscriptionRequest;
import com.example.backend.dto.response.SubscriptionResponse;
import com.example.backend.entities.Subscription;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {
    Subscription toSubscription(SubscriptionRequest subscriptionRequest);
    SubscriptionResponse toSubscriptionResponse(Subscription subscription);
}
