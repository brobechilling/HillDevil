package com.example.backend.service;

import com.example.backend.dto.BranchMenuItemDTO;
import com.example.backend.dto.MenuItemDTO;
import com.example.backend.entities.BranchMenuItem;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.MenuItemMapper;
import com.example.backend.repository.BranchMenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BranchMenuItemService {

    private final BranchMenuItemRepository branchMenuItemRepository;
    private final MenuItemMapper menuItemMapper;

    public BranchMenuItemService(BranchMenuItemRepository branchMenuItemRepository, MenuItemMapper menuItemMapper) {
        this.branchMenuItemRepository = branchMenuItemRepository;
        this.menuItemMapper = menuItemMapper;
    }

    public List<BranchMenuItemDTO> getMenuItemsByBranch(UUID branchId) {
        List<BranchMenuItem> branchMenuItems = branchMenuItemRepository.findAllByBranch_BranchId(branchId);

        if (branchMenuItems == null || branchMenuItems.isEmpty()) {
            return Collections.emptyList();
        }

        return branchMenuItems.stream().map(branchMenuItem -> {
            MenuItemDTO base = menuItemMapper.toMenuItemDTO(branchMenuItem.getMenuItem());
            BranchMenuItemDTO dto = new BranchMenuItemDTO();

            dto.setMenuItemId(base.getMenuItemId());
            dto.setName(base.getName());
            dto.setDescription(base.getDescription());
            dto.setPrice(base.getPrice());
            dto.setBestSeller(base.isBestSeller());
            dto.setHasCustomization(base.isHasCustomization());
            dto.setCategoryId(base.getCategoryId());
            dto.setAvailable(branchMenuItem.isAvailable());
            dto.setBranchId(branchMenuItem.getBranch().getBranchId());
            return dto;
        }).collect(Collectors.toList());
    }

    public void updateAvailability(UUID branchMenuItemId, boolean available) {
        BranchMenuItem entity = branchMenuItemRepository.findById(branchMenuItemId)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCHMENUITEM_NOT_FOUND));
        entity.setAvailable(available);
        branchMenuItemRepository.save(entity);
    }
}
