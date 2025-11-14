package com.example.backend.service;

import com.example.backend.entities.FeatureCode;
import com.example.backend.entities.Package;
import com.example.backend.entities.PackageFeature;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.PackageFeatureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
public class FeatureLimitCheckerService {

    private final SubscriptionLookupService subscriptionLookupService;
    private final PackageFeatureRepository packageFeatureRepository;

    public FeatureLimitCheckerService(SubscriptionLookupService subscriptionLookupService,
            PackageFeatureRepository packageFeatureRepository) {
        this.subscriptionLookupService = subscriptionLookupService;
        this.packageFeatureRepository = packageFeatureRepository;
    }

    @Transactional(readOnly = true)
    public void checkLimit(UUID restaurantId, FeatureCode featureCode, Supplier<Long> currentCountSupplier) {
        Package pack = subscriptionLookupService.getActivePackageByRestaurant(restaurantId);

        Map<FeatureCode, Integer> featureLimitMap = packageFeatureRepository.findByPackageId(pack.getPackageId())
                .stream()
                .filter(pf -> pf.getFeature().getCode() != null)
                .collect(Collectors.toMap(
                        pf -> pf.getFeature().getCode(),
                        PackageFeature::getValue));

        Integer limit = featureLimitMap.get(featureCode);
        if (limit == null || limit == 0) {
            return;
        }

        long currentCount = currentCountSupplier.get();
        if (currentCount > limit) {
            throw new AppException(ErrorCode.LIMIT_EXCEEDED);
        }
    }

    @Transactional(readOnly = true)
    public boolean isUnderLimit(UUID restaurantId, FeatureCode featureCode, Supplier<Long> currentCountSupplier) {
        Package pack = subscriptionLookupService.getActivePackageByRestaurant(restaurantId);

        Map<FeatureCode, Integer> featureLimitMap = packageFeatureRepository.findByPackageId(pack.getPackageId())
                .stream()
                .filter(pf -> pf.getFeature().getCode() != null)
                .collect(Collectors.toMap(
                        pf -> pf.getFeature().getCode(),
                        PackageFeature::getValue));

        Integer limit = featureLimitMap.get(featureCode);

        if (limit == null || limit == 0) {
            return true;
        }

        long currentCount = currentCountSupplier.get();
        return currentCount < limit;
    }

    @Transactional(readOnly = true)
    public int getLimitValue(UUID restaurantId, FeatureCode featureCode) {
        Package pack = subscriptionLookupService.getActivePackageByRestaurant(restaurantId);
        Map<FeatureCode, Integer> featureLimitMap = packageFeatureRepository.findByPackageId(pack.getPackageId())
                .stream()
                .filter(pf -> pf.getFeature().getCode() != null)
                .collect(Collectors.toMap(
                        pf -> pf.getFeature().getCode(),
                        PackageFeature::getValue));

        return featureLimitMap.getOrDefault(featureCode, 0);
    }
}
