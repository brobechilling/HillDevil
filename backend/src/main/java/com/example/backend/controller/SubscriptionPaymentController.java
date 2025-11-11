package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.TopSpenderDTO;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.service.SubscriptionPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.type.Webhook;
import java.util.List;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class SubscriptionPaymentController {

    private final SubscriptionPaymentService subscriptionPaymentService;

    public SubscriptionPaymentController(SubscriptionPaymentService subscriptionPaymentService) {
        this.subscriptionPaymentService = subscriptionPaymentService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<SubscriptionPaymentResponse>> createPayment(
            @RequestParam UUID subscriptionId
    ) {
        SubscriptionPaymentResponse result = subscriptionPaymentService.createPayment(subscriptionId);

        ApiResponse<SubscriptionPaymentResponse> response = new ApiResponse<>();
        response.setMessage("Created payment successfully");
        response.setResult(result);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<String>> handleWebhook(@RequestBody Webhook webhookBody) {
        subscriptionPaymentService.handlePaymentWebhook(webhookBody);

        ApiResponse<String> response = new ApiResponse<>();
        response.setMessage("Webhook handled successfully");
        response.setResult("OK");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{orderCode}")
    public ResponseEntity<ApiResponse<SubscriptionPaymentResponse>> getPaymentStatus(
            @PathVariable Long orderCode
    ) {
        SubscriptionPaymentResponse result = subscriptionPaymentService.getPaymentStatus(orderCode);

        ApiResponse<SubscriptionPaymentResponse> response = new ApiResponse<>();
        response.setMessage("Fetched payment status successfully");
        response.setResult(result);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/cancel/{orderCode}")
    public ResponseEntity<ApiResponse<SubscriptionPaymentResponse>> cancelPayment(
            @PathVariable Long orderCode
    ) {
        SubscriptionPaymentResponse result = subscriptionPaymentService.cancelPayment(orderCode);

        ApiResponse<SubscriptionPaymentResponse> response = new ApiResponse<>();
        response.setMessage("Canceled payment successfully");
        response.setResult(result);

        return ResponseEntity.ok(response);
    }

        @GetMapping("/top-spenders")
    public ApiResponse<List<TopSpenderDTO>> getTopSpenders(@RequestParam(defaultValue = "5") int limit) {
        ApiResponse<List<TopSpenderDTO>> res = new ApiResponse<>();
        res.setResult(subscriptionPaymentService.getTopSpenders(limit));
        return res;
    }
}
