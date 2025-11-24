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

        // If feature doesn't exist in package (e.g., Premium doesn't have Basic limits)
        // No limit check needed (unlimited)
        if (!featureLimitMap.containsKey(featureCode)) {
            return; // Unlimited
        }

        Integer limit = featureLimitMap.get(featureCode);
        // If limit is null or 0, it means unlimited
        if (limit == null || limit == 0) {
            return;
        }

        long currentCount = currentCountSupplier.get();
        if (currentCount >= limit) {
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

        // If feature doesn't exist in package (e.g., Premium doesn't have Basic limits)
        // Return true (unlimited)
        if (!featureLimitMap.containsKey(featureCode)) {
            return true; // Unlimited
        }

        Integer limit = featureLimitMap.get(featureCode);

        // If limit is null or 0, it means unlimited
        if (limit == null || limit == 0) {
            return true;
        }

        long currentCount = currentCountSupplier.get();
        return currentCount < limit;
    }

    @Transactional(readOnly = true)
    public int getLimitValue(UUID restaurantId, FeatureCode featureCode) {
        try {
            Package pack = subscriptionLookupService.getActivePackageByRestaurant(restaurantId);
            Map<FeatureCode, Integer> featureLimitMap = packageFeatureRepository.findByPackageId(pack.getPackageId())
                    .stream()
                    .filter(pf -> pf.getFeature().getCode() != null)
                    .collect(Collectors.toMap(
                            pf -> pf.getFeature().getCode(),
                            PackageFeature::getValue));

            // If feature doesn't exist in package (e.g., Premium doesn't have Basic limits)
            // Return -1 to indicate unlimited (no limit)
            if (!featureLimitMap.containsKey(featureCode)) {
                return -1; // Unlimited
            }
            
            Integer limit = featureLimitMap.get(featureCode);
            // If limit is 0, it means unlimited
            return (limit == null || limit == 0) ? -1 : limit;
        } catch (AppException e) {
            // No active subscription found - return 0 (no access)
            return 0;
        }
    }
}
