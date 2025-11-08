package com.example.backend.service;

import com.example.backend.dto.FeatureDTO;
import com.example.backend.dto.FeatureValueDTO;
import com.example.backend.dto.PackageFeatureDTO;
import com.example.backend.entities.Feature;
import com.example.backend.entities.Package;
import com.example.backend.entities.PackageFeature;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.FeatureValueMapper;
import com.example.backend.repository.PackageFeatureRepository;
import com.example.backend.repository.PackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PackageFeatureService {

    private final PackageFeatureRepository packageFeatureRepository;
    private final PackageRepository packageRepository;
    private final FeatureService featureService;
    private final FeatureValueMapper featureValueMapper;

    public PackageFeatureService(PackageFeatureRepository packageFeatureRepository,
                                 PackageRepository packageRepository,
                                 FeatureService featureService,
                                 FeatureValueMapper featureValueMapper) {
        this.packageFeatureRepository = packageFeatureRepository;
        this.packageRepository = packageRepository;
        this.featureService = featureService;
        this.featureValueMapper = featureValueMapper;
    }

    @Transactional(readOnly = true)
    public List<PackageFeatureDTO> getAllPackagesWithFeatures() {
        return packageRepository.findAllWithFeatures()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public PackageFeatureDTO getPackageWithFeatures(UUID packageId) {
        Package pkg = packageRepository.findOneWithFeaturesByPackageId(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));
        return mapToDTO(pkg);
    }

    @Transactional
    public void addOrUpdateFeature(UUID packageId, FeatureValueDTO dto) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));

        FeatureDTO featureDTO = featureValueMapper.toFeatureDto(dto);
        Feature feature = featureService.createOrFindFeature(featureDTO);

        PackageFeature pf = packageFeatureRepository
                .findByaPackage_PackageIdAndFeature_FeatureId(packageId, feature.getFeatureId())
                .orElse(new PackageFeature());

        pf.setaPackage(pkg);
        pf.setFeature(feature);
        pf.setValue(dto.getValue());

        packageFeatureRepository.save(pf);
    }

    @Transactional
    public void deleteFeatureFromPackage(UUID packageId, UUID featureId) {
        PackageFeature pf = packageFeatureRepository
                .findByaPackage_PackageIdAndFeature_FeatureId(packageId, featureId)
                .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOTEXISTED_IN_PACKAGE));

        packageFeatureRepository.delete(pf);
    }

    private PackageFeatureDTO mapToDTO(Package pkg) {
        List<FeatureValueDTO> features = pkg.getPackageFeatures().stream()
                .map(pf -> {
                    FeatureValueDTO dto = new FeatureValueDTO();
                    dto.setFeatureId(pf.getFeature().getFeatureId());
                    dto.setFeatureName(pf.getFeature().getName());
                    dto.setDescription(pf.getFeature().getDescription());
                    dto.setValue(pf.getValue());
                    return dto;
                })
                .collect(Collectors.toList());

        PackageFeatureDTO dto = new PackageFeatureDTO();
        dto.setPackageId(pkg.getPackageId());
        dto.setName(pkg.getName());
        dto.setDescription(pkg.getDescription());
        dto.setPrice(pkg.getPrice());
        dto.setAvailable(pkg.isAvailable());
        dto.setBillingPeriod(pkg.getBillingPeriod());
        dto.setFeatures(features);

        return dto;
    }
}
