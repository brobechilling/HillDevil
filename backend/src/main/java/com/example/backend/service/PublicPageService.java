package com.example.backend.service;

import com.example.backend.dto.response.MenuPublicResponse;
import com.example.backend.dto.response.RestaurantPublicResponse;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.PublicPageMapper;
import com.example.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PublicPageService {

        private final RestaurantRepository restaurantRepository;
        private final BranchRepository branchRepository;
        private final MenuItemRepository menuItemRepository;
        private final PublicPageMapper mapper;
        private final MediaService mediaService;

        public PublicPageService(
                        RestaurantRepository restaurantRepository,
                        BranchRepository branchRepository,
                        TableRepository tableRepository,
                        BranchMenuItemRepository branchMenuItemRepository,
                        MenuItemRepository menuItemRepository,
                        PublicPageMapper mapper,
                        MediaService mediaService) {
                this.restaurantRepository = restaurantRepository;
                this.branchRepository = branchRepository;
                this.menuItemRepository = menuItemRepository;
                this.mapper = mapper;
                this.mediaService = mediaService;
        }

        public RestaurantPublicResponse getRestaurantBySlug(String slug) {
                Restaurant restaurant = null;
                try {
                        UUID id = UUID.fromString(slug);
                        restaurant = restaurantRepository.findById(id).orElse(null);
                } catch (IllegalArgumentException ignored) {
                }

                if (restaurant == null) {
                        String suffix = "/" + slug;
                        restaurant = restaurantRepository.findByPublicUrlEndingWith(suffix)
                                        .stream().findFirst()
                                        .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
                }

                List<Branch> branches = branchRepository
                                .findByRestaurant_RestaurantIdAndIsActiveTrue(restaurant.getRestaurantId());
                List<RestaurantPublicResponse.BranchInfo> branchInfos = branches.stream()
                                .map(mapper::branchToBranchInfo)
                                .collect(Collectors.toList());
                RestaurantPublicResponse resp = mapper.restaurantToRestaurantPublicResponse(restaurant);
                resp.setBranches(branchInfos);

                return resp;
        }

        public MenuPublicResponse getRestaurantMenuBySlug(String slug) {
                Restaurant restaurant = null;
                try {
                        UUID id = UUID.fromString(slug);
                        restaurant = restaurantRepository.findById(id).orElse(null);
                } catch (IllegalArgumentException ignored) {
                }

                if (restaurant == null) {
                        String suffix = "/" + slug;
                        restaurant = restaurantRepository.findByPublicUrlEndingWith(suffix)
                                        .stream().findFirst()
                                        .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
                }

                List<MenuItem> items = menuItemRepository
                                .findAllByRestaurant_RestaurantIdAndStatus(restaurant.getRestaurantId(),
                                                MenuItemStatus.ACTIVE);

                MenuPublicResponse resp = new MenuPublicResponse();
                resp.setRestaurantId(restaurant.getRestaurantId());
                resp.setItems(items.stream()
                                .map(item -> {
                                        MenuPublicResponse.MenuItemDTO dto = mapper.menuItemToMenuItemDTO(item);
                                        dto.setImageUrl(mediaService.getImageUrlByTarget(item.getMenuItemId(),
                                                        "MENU_ITEM_IMAGE")); // 👈 thêm dòng này
                                        return dto;
                                })
                                .collect(Collectors.toList()));

                return resp;
        }

}