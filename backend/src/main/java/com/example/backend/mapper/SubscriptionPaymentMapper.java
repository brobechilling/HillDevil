package com.example.backend.mapper;

import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.entities.SubscriptionPayment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface SubscriptionPaymentMapper {
    @Mapping(source = "purpose", target = "purpose")
    @Mapping(source = "subscription.restaurant.restaurantId", target = "restaurantId")
    @Mapping(source = "subscription.restaurant.name", target = "restaurantName")
    SubscriptionPaymentResponse toSubscriptionPaymentResponse(SubscriptionPayment payment);

}
