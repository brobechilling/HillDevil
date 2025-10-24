package com.example.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.backend.dto.RestaurantDTO;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.RestaurantMapper;
import com.example.backend.repository.RestaurantRepository;
import com.example.backend.repository.UserRepository;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantMapper restaurantMapper;
    private final UserRepository userRepository;

    public RestaurantService(RestaurantRepository restaurantRepository, RestaurantMapper restaurantMapper,
            UserRepository userRepository) {
        this.restaurantRepository = restaurantRepository;
        this.restaurantMapper = restaurantMapper;
        this.userRepository = userRepository;
    }

    public List<RestaurantDTO> getAll() {
        return restaurantRepository.findAll().stream().map(r -> restaurantMapper.toRestaurantDto(r)).toList();
    }

    public RestaurantDTO getById(UUID id) {
        Restaurant r = restaurantRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
        return restaurantMapper.toRestaurantDto(r);
    }

    public RestaurantDTO create(RestaurantDTO dto) {
        // verify owner exists
        var owner = userRepository.findById(dto.getUserId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));
        Restaurant restaurant = restaurantMapper.toRestaurant(dto);
        // explicitly set owner to avoid mapping issues
        restaurant.setUser(owner);
        Restaurant saved = restaurantRepository.save(restaurant);
        return restaurantMapper.toRestaurantDto(saved);
    }

    public RestaurantDTO update(UUID id, RestaurantDTO dto) {
        Restaurant exist = restaurantRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
        // only update mutable fields
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
        return restaurantRepository.findByUser_UserId(userId).stream().map(r -> restaurantMapper.toRestaurantDto(r)).toList();
    }

    public PageResponse<RestaurantDTO> getRestaurantPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<Restaurant> pageData = restaurantRepository.findAll(pageable);
        PageResponse<RestaurantDTO> pageResponse = new PageResponse<>();
        pageResponse.setItems(pageData.map(restaurant -> restaurantMapper.toRestaurantDto(restaurant)).toList());
        pageResponse.setTotalElements(pageData.getTotalElements());
        pageResponse.setTotalPages(pageData.getTotalPages());
        return pageResponse;
    }

}
