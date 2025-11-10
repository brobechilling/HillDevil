package com.example.backend.service;

import com.example.backend.entities.*;
import com.example.backend.repository.SubscriptionPaymentRepository;
import com.example.backend.repository.SubscriptionRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SubscriptionAnalyticsService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final UserRepository userRepository;

    public SubscriptionAnalyticsService(SubscriptionRepository subscriptionRepository,
                                        SubscriptionPaymentRepository subscriptionPaymentRepository,
                                        UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionPaymentRepository = subscriptionPaymentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> countActivePackages() {
        return subscriptionRepository.findAll().stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE && s.getaPackage() != null)
                .collect(Collectors.groupingBy(
                        s -> s.getaPackage().getName(),
                        Collectors.counting()
                ));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTop5SpendingUsers() {
        var payments = subscriptionPaymentRepository.findAll().stream()
                .filter(p -> p.getSubscriptionPaymentStatus() == SubscriptionPaymentStatus.SUCCESS
                        && p.getSubscription() != null
                        && p.getSubscription().getRestaurant() != null
                        && p.getSubscription().getRestaurant().getUser() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getSubscription().getRestaurant().getUser(),
                        Collectors.mapping(SubscriptionPayment::getAmount, Collectors.toList())
                ));

        return payments.entrySet().stream()
                .map(e -> {
                    BigDecimal total = e.getValue().stream()
                            .map(BigDecimal::valueOf)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    Map<String, Object> map = new HashMap<>();
                    map.put("userId", e.getKey().getUserId());
                    map.put("username", e.getKey().getUsername());
                    map.put("email", e.getKey().getEmail());
                    map.put("totalSpent", total);
                    return map;
                })
                .sorted((a, b) -> ((BigDecimal) b.get("totalSpent")).compareTo((BigDecimal) a.get("totalSpent")))
                .limit(5)
                .collect(Collectors.toList());
    }
}
