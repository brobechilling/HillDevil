package com.example.backend.service;

import com.example.backend.dto.FeatureDTO;
import com.example.backend.entities.Feature;
import com.example.backend.mapper.FeatureMapper;
import com.example.backend.repository.FeatureRepository;
import org.springframework.stereotype.Service;

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

    public Feature createOrFindFeature(FeatureDTO dto) {
        if (dto.getId() != null) {
            return featureRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Feature not found with id: " + dto.getId()));
        }

        return featureRepository.findByName(dto.getName())
                .orElseGet(() -> {
                    Feature f = new Feature();
                    f.setFeatureId(UUID.randomUUID());
                    f.setName(dto.getName());
                    f.setDescription(dto.getDescription());
                    return featureRepository.save(f);
                });
    }
}