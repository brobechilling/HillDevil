package com.example.backend.mapper;

import com.example.backend.dto.SubscriptionPaymentDTO;
import com.example.backend.entities.SubscriptionPayment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubscriptionPaymentMapper {
    SubscriptionPaymentDTO toSubscriptionPaymentDto(SubscriptionPayment subscriptionPayment);
    SubscriptionPayment toSubscriptionPayment(SubscriptionPaymentDTO subscriptionPaymentDTO);
}
