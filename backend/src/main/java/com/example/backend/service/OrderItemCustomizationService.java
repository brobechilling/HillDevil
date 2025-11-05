package com.example.backend.service;

import com.example.backend.dto.OrderItemCustomizationDTO;
import com.example.backend.dto.request.CreateOrderItemCustomizationRequest;
import com.example.backend.entities.Customization;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.OrderItemCustomization;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderItemCustomizationMapper;
import com.example.backend.repository.CustomizationRepository;
import com.example.backend.repository.OrderItemCustomizationRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderItemCustomizationService {

    private final OrderItemCustomizationRepository orderItemCustomizationRepository;
    private final CustomizationRepository customizationRepository;
    private final OrderItemCustomizationMapper mapper;

    public OrderItemCustomizationService(OrderItemCustomizationRepository orderItemCustomizationRepository,
                                         CustomizationRepository customizationRepository,
                                         OrderItemCustomizationMapper mapper) {
        this.orderItemCustomizationRepository = orderItemCustomizationRepository;
        this.customizationRepository = customizationRepository;
        this.mapper = mapper;
    }

    @Transactional
    public List<OrderItemCustomizationDTO> createCustomizations(
            List<CreateOrderItemCustomizationRequest> requests,
            OrderItem orderItem) {

        List<OrderItemCustomization> entities = new ArrayList<>();

        for (CreateOrderItemCustomizationRequest req : requests) {
            Customization customization = customizationRepository.findById(req.getCustomizationId())
                    .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND));

            OrderItemCustomization entity = new OrderItemCustomization();
            entity.setOrderItem(orderItem);
            entity.setCustomization(customization);
            entity.setQuantity(req.getQuantity());

            // ✅ tự tính giá customization
            entity.setTotalPrice(customization.getPrice()
                    .multiply(BigDecimal.valueOf(req.getQuantity())));

            entities.add(entity);
        }

        List<OrderItemCustomization> saved = orderItemCustomizationRepository.saveAll(entities);
        return mapper.toDtoList(saved);
    }

}
