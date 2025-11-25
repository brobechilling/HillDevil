package com.example.backend.service;

import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.BranchDTO;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Restaurant;
import com.example.backend.entities.FeatureCode;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.BranchMapper;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.RestaurantRepository;

@Service
public class BranchService {

    private final BranchRepository branchRepository;
    private final BranchMapper branchMapper;
    private final RestaurantRepository restaurantRepository;
    private final FeatureLimitCheckerService featureLimitCheckerService;

    public BranchService(
            BranchRepository branchRepository,
            BranchMapper branchMapper,
            RestaurantRepository restaurantRepository,
            FeatureLimitCheckerService featureLimitCheckerService
    ) {
        this.branchRepository = branchRepository;
        this.branchMapper = branchMapper;
        this.restaurantRepository = restaurantRepository;
        this.featureLimitCheckerService = featureLimitCheckerService;
    }

    public List<BranchDTO> getAll() {
        return branchRepository.findAll().stream().map(branchMapper::toDto).toList();
    }

    public BranchDTO getById(UUID id) {
        Branch b = branchRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        return branchMapper.toDto(b);
    }

    @Transactional
    public BranchDTO create(BranchDTO dto) {
        // Validate required fields
        if (dto.getOpeningTime() == null || dto.getClosingTime() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        Branch entity = branchMapper.toEntity(dto);
        entity.setRestaurant(restaurant);
        entity.setActive(true);

        Branch saved = branchRepository.save(entity);
        return branchMapper.toDto(saved);
    }

    @Transactional
    public BranchDTO update(UUID id, BranchDTO dto) {
        // Validate required fields
        if (dto.getOpeningTime() == null || dto.getClosingTime() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        
        Branch exist = branchRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        branchMapper.updateEntityFromDto(dto, exist);
        Branch saved = branchRepository.save(exist);
        return branchMapper.toDto(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Branch exist = branchRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        exist.setActive(false);
        branchRepository.save(exist);
    }

    public List<BranchDTO> getByRestaurant(UUID restaurantId) {
        return branchRepository.findByRestaurant_RestaurantId(restaurantId)
                .stream().map(branchMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public UUID getRestaurantIdByBranchId(UUID branchId) {
        return branchRepository.findRestaurantIdByBranchId(branchId)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
    }

    @Transactional(readOnly = true)
    public boolean canCreateBranch(UUID restaurantId) {
        Supplier<Long> currentCountSupplier = () ->
                branchRepository.countByRestaurant_RestaurantId(restaurantId);

        return featureLimitCheckerService.isUnderLimit(
                restaurantId,
                FeatureCode.LIMIT_BRANCH_CREATION,
                currentCountSupplier
        );
    }

    @Transactional(readOnly = true)
    public List<BranchDTO> getBranchesByOwner(UUID ownerId) {
        return branchRepository.findByOwnerId(ownerId)
                .stream()
                .map(branchMapper::toDto)
                .toList();
    }
}