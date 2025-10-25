package com.example.backend.service;

import java.util.List;
import java.util.UUID;

import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.dto.RestaurantDTO;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.RestaurantMapper;
import com.example.backend.repository.RestaurantRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantMapper restaurantMapper;
    private final UserRepository userRepository;

    @Value("${frontend.base-url}")
    private String webUrl; // 👈 lấy từ application.yml, ví dụ hilldevil.space

    public RestaurantService(RestaurantRepository restaurantRepository, RestaurantMapper restaurantMapper,
                             UserRepository userRepository) {
        this.restaurantRepository = restaurantRepository;
        this.restaurantMapper = restaurantMapper;
        this.userRepository = userRepository;
    }

    public List<RestaurantDTO> getAll() {
        return restaurantRepository.findAll().stream()
                .map(restaurantMapper::toRestaurantDto)
                .toList();
    }

    public RestaurantDTO getById(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
        return restaurantMapper.toRestaurantDto(restaurant);
    }

    @Transactional
    public Restaurant createEntity(RestaurantCreateRequest request) {
        var owner = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));

        Restaurant restaurant = new Restaurant();
        restaurant.setUser(owner);
        restaurant.setName(request.getName());
        restaurant.setEmail(request.getEmail());
        restaurant.setRestaurantPhone(request.getRestaurantPhone());
        restaurant.setDescription(request.getDescription());
        restaurant.setStatus(false);

        // 👉 Xử lý URL thông minh cho cả local và production
        String base = webUrl.trim();

        // Nếu không có http/https -> tự động thêm
        if (!base.startsWith("http://") && !base.startsWith("https://")) {
            if (base.contains("localhost") || base.contains("127.0.0.1")) {
                base = "http://" + base;
            } else {
                base = "https://" + base;
            }
        }

        // Bỏ dấu "/" cuối nếu có
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }

        // Tạo slug từ tên nhà hàng
        String slug = request.getName()
                .toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        restaurant.setPublicUrl(base + "/" + slug);

        return restaurantRepository.save(restaurant);
    }

    public RestaurantDTO update(UUID id, RestaurantDTO dto) {
        Restaurant exist = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        exist.setName(dto.getName());
        exist.setEmail(dto.getEmail());
        exist.setRestaurantPhone(dto.getRestaurantPhone());
        exist.setStatus(dto.isStatus());
        exist.setPublicUrl(dto.getPublicUrl());
        exist.setDescription(dto.getDescription());

        Restaurant saved = restaurantRepository.save(exist);
        return restaurantMapper.toRestaurantDto(saved);
    }

    public void delete(UUID id) {
        if (!restaurantRepository.existsById(id))
            throw new AppException(ErrorCode.RESTAURANT_NOTEXISTED);
        restaurantRepository.deleteById(id);
    }

    public List<RestaurantDTO> getByOwner(UUID userId) {
        return restaurantRepository.findByUser_UserId(userId).stream()
                .map(restaurantMapper::toRestaurantDto)
                .toList();
    }

    public PageResponse<RestaurantDTO> getRestaurantPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Restaurant> pageData = restaurantRepository.findAll(pageable);
        PageResponse<RestaurantDTO> pageResponse = new PageResponse<>();
        pageResponse.setItems(pageData.map(restaurantMapper::toRestaurantDto).toList());
        pageResponse.setTotalElements(pageData.getTotalElements());
        pageResponse.setTotalPages(pageData.getTotalPages());
        return pageResponse;
    }
}
