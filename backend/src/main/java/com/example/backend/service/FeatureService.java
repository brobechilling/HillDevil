package com.example.backend.service;

import com.example.backend.dto.FeatureDTO;
import com.example.backend.entities.Feature;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.FeatureMapper;
import com.example.backend.repository.FeatureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FeatureService {
    private final FeatureRepository featureRepository;
    private final FeatureMapper featureMapper;

    public FeatureService(FeatureRepository featureRepository,
                          FeatureMapper featureMapper) {
        this.featureRepository = featureRepository;
        this.featureMapper = featureMapper;
    }

    public List<FeatureDTO> getAllAvailableFeatures() {
        return featureRepository.findAll()
                .stream()
                .map(featureMapper::toFeatureDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Feature createOrFindFeature(FeatureDTO dto) {
        if (dto.getId() != null) {
            return featureRepository.findById(dto.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOTEXISTED));
        }

        return featureRepository.findByName(dto.getName().trim())
                .orElseGet(() -> {
                    if (dto.getName() == null || dto.getName().trim().isEmpty()) {
                        throw new RuntimeException("Feature name cannot be null or empty");
                    }
                    Feature f = new Feature();
                    f.setName(dto.getName().trim());
                    f.setDescription(dto.getDescription());
                    return featureRepository.save(f);
                });
    }
}
