package com.example.backend.mapper;

import com.example.backend.dto.SubscriptionDTO;
import com.example.backend.entities.Subscription;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {
    SubscriptionDTO toSubscriptionDto(Subscription subscription);
    Subscription toSubscriptionDto(SubscriptionDTO subscriptionDTO);
}
