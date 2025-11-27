package com.example.backend.service;

import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.BranchDTO;
import com.example.backend.entities.Branch;
import com.example.backend.entities.BranchMenuItem;
import com.example.backend.entities.MenuItem;
import com.example.backend.entities.MenuItemStatus;
import com.example.backend.entities.Restaurant;
import com.example.backend.entities.FeatureCode;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.BranchMapper;
import com.example.backend.repository.BranchMenuItemRepository;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.MenuItemRepository;
import com.example.backend.repository.RestaurantRepository;

@Service
public class BranchService {

    private final BranchRepository branchRepository;
    private final BranchMapper branchMapper;
    private final RestaurantRepository restaurantRepository;
    private final FeatureLimitCheckerService featureLimitCheckerService;
    private final BranchMenuItemRepository branchMenuItemRepository;
    private final MenuItemRepository menuItemRepository;

    public BranchService(
            BranchRepository branchRepository,
            BranchMapper branchMapper,
            RestaurantRepository restaurantRepository,
            FeatureLimitCheckerService featureLimitCheckerService,
            BranchMenuItemRepository branchMenuItemRepository,
            MenuItemRepository menuItemRepository
    ) {
        this.branchRepository = branchRepository;
        this.branchMapper = branchMapper;
        this.restaurantRepository = restaurantRepository;
        this.featureLimitCheckerService = featureLimitCheckerService;
        this.branchMenuItemRepository = branchMenuItemRepository;
        this.menuItemRepository = menuItemRepository;
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
        
        // Automatically create BranchMenuItem records for all active menu items
        List<MenuItem> activeMenuItems = 
            menuItemRepository.findAllByRestaurant_RestaurantIdAndStatus(
                restaurant.getRestaurantId(), 
                MenuItemStatus.ACTIVE
            );
        
        for (MenuItem menuItem : activeMenuItems) {
            BranchMenuItem branchMenuItem = new BranchMenuItem();
            branchMenuItem.setBranch(saved);
            branchMenuItem.setMenuItem(menuItem);
            branchMenuItem.setAvailable(true); // Set as available by default
            branchMenuItemRepository.save(branchMenuItem);
        }
        
        return branchMapper.toDto(saved);
    }

    @Transactional
    public BranchDTO update(UUID id, BranchDTO dto) {
        Branch exist = branchRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        // Only validate opening/closing time if they are being updated
        // This allows partial updates (e.g., just updating isActive status)
        if (dto.getOpeningTime() != null && dto.getClosingTime() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (dto.getOpeningTime() == null && dto.getClosingTime() != null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

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

    public List<BranchDTO> getActiveByRestaurant(UUID restaurantId) {
        return branchRepository.findByRestaurant_RestaurantIdAndIsActiveTrue(restaurantId)
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
                branchRepository.countByRestaurant_RestaurantIdAndIsActiveTrue(restaurantId);

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