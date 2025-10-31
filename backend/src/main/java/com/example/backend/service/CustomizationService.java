package com.example.backend.service;

import com.example.backend.dto.CustomizationDTO;
import com.example.backend.dto.request.CustomizationCreateRequest;
import com.example.backend.entities.Customization;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.CustomizationMapper;
import com.example.backend.repository.CustomizationRepository;
import com.example.backend.repository.RestaurantRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class CustomizationService {

    private final CustomizationRepository customizationRepository;
    private final CustomizationMapper customizationMapper;
    private final RestaurantRepository restaurantRepository;
    private final Logger logger = LoggerFactory.getLogger(CustomizationService.class);

    public CustomizationService(CustomizationRepository customizationRepository,
                                CustomizationMapper customizationMapper,
                                RestaurantRepository restaurantRepository) {
        this.customizationRepository = customizationRepository;
        this.customizationMapper = customizationMapper;
        this.restaurantRepository = restaurantRepository;
    }

    public List<CustomizationDTO> getAll() {
        List<Customization> list = customizationRepository.findAll();
        return list.isEmpty()
                ? Collections.emptyList()
                : list.stream().map(customizationMapper::toCustomizationDTO).toList();
    }

    public CustomizationDTO getById(UUID id) {
        Customization customization = customizationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND));
        return customizationMapper.toCustomizationDTO(customization);
    }

    @Transactional
    public CustomizationDTO create(CustomizationCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        Customization entity = new Customization();
        entity.setName(request.getName());
        entity.setPrice(request.getPrice());
        entity.setRestaurant(restaurant);
        entity.setCreatedAt(Instant.now());

        logger.info("customization created");
        return customizationMapper.toCustomizationDTO(customizationRepository.save(entity));
    }

    @Transactional
    public CustomizationDTO update(UUID id, CustomizationDTO dto) {
        return customizationRepository.findById(id)
                .map(exist -> {
                    exist.setName(dto.getName());
                    exist.setPrice(dto.getPrice());
                    exist.setUpdatedAt(Instant.now());
                    logger.info("customization updated");
                    return customizationMapper.toCustomizationDTO(customizationRepository.save(exist));
                })
                .orElse(null); // ✅ Không throw nếu chưa có
    }

    @Transactional
    public void delete(UUID id) {
        customizationRepository.findById(id).ifPresent(customization -> {
            customization.setStatus(false);
            customizationRepository.save(customization);
            logger.info("customization deleted safely");
        });
    }
}
