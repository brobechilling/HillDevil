package com.example.backend.mapper;

import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.entities.SubscriptionPayment;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface SubscriptionPaymentMapper {
    SubscriptionPaymentResponse toSubscriptionPaymentResponse(SubscriptionPayment payment);

}
