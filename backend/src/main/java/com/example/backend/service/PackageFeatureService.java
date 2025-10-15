package com.example.backend.service;

import com.example.backend.dto.FeatureDTO;
import com.example.backend.entities.Feature;
import com.example.backend.entities.Package;
import com.example.backend.entities.PackageFeature;
import com.example.backend.repository.PackageFeatureRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PackageFeatureService {
    private final PackageFeatureRepository packageFeatureRepository;
    private final FeatureService featureService;

    public PackageFeatureService(PackageFeatureRepository packageFeatureRepository,
                                 FeatureService featureService) {
        this.packageFeatureRepository = packageFeatureRepository;
        this.featureService = featureService;
    }

    public void assignFeaturesToPackage(Package pkg, List<FeatureDTO> featureDTOs) {
        if (featureDTOs == null || featureDTOs.isEmpty()) return;

        for (FeatureDTO dto : featureDTOs) {
            Feature feature = featureService.createOrFindFeature(dto);
            PackageFeature pf = new PackageFeature(pkg, feature, dto.getValue());
            packageFeatureRepository.save(pf);
        }
    }

    public void updatePackageFeatures(Package pkg, List<FeatureDTO> featureDTOs) {
        if (featureDTOs == null) featureDTOs = Collections.emptyList();

        List<PackageFeature> existing = packageFeatureRepository.findByPackage_PackageId(pkg.getPackageId());
        Map<UUID, PackageFeature> existingMap = existing.stream()
                .collect(Collectors.toMap(pf -> pf.getFeature().getFeatureId(), pf -> pf));

        Set<UUID> newFeatureIds = featureDTOs.stream()
                .map(FeatureDTO::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        for (PackageFeature pf : existing) {
            if (!newFeatureIds.contains(pf.getFeature().getFeatureId())) {
                packageFeatureRepository.delete(pf);
            }
        }

        for (FeatureDTO dto : featureDTOs) {
            Feature feature = featureService.createOrFindFeature(dto);
            PackageFeature pf = existingMap.get(feature.getFeatureId());

            if (pf != null) {
                if (pf.getValue() != dto.getValue()) {
                    pf.setValue(dto.getValue());
                    packageFeatureRepository.save(pf);
                }
            } else {
                PackageFeature newPF = new PackageFeature(pkg, feature, dto.getValue());
                packageFeatureRepository.save(newPF);
            }
        }
    }
}
