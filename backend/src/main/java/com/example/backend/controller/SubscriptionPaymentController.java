package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.service.PayOSService;
import com.example.backend.service.SubscriptionPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.type.PaymentLinkData;
import vn.payos.type.Webhook;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class SubscriptionPaymentController {

    private final SubscriptionPaymentService subscriptionPaymentService;
    private final PayOSService payOSService;

    public SubscriptionPaymentController(
            SubscriptionPaymentService subscriptionPaymentService,
            PayOSService payOSService
    ) {
        this.subscriptionPaymentService = subscriptionPaymentService;
        this.payOSService = payOSService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<SubscriptionPaymentResponse>> createPayment(
            @RequestParam UUID subscriptionId
    ) {
        SubscriptionPaymentResponse result = subscriptionPaymentService.createPayment(subscriptionId);

        ApiResponse<SubscriptionPaymentResponse> response = new ApiResponse<>();
        response.setMessage("Created Payment successfully");
        response.setResult(result);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<String>> handleWebhook(@RequestBody Webhook webhookBody) {
        subscriptionPaymentService.handlePaymentSuccess(webhookBody);

        ApiResponse<String> response = new ApiResponse<>();
        response.setMessage("Webhook handled successfully");
        response.setResult("OK");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/confirm-webhook")
    public ResponseEntity<ApiResponse<String>> confirmWebhook(@RequestParam String webhookUrl) {
        String verifiedUrl = payOSService.confirmWebhook(webhookUrl);

        ApiResponse<String> response = new ApiResponse<>();
        response.setMessage("Webhook URL verified");
        response.setResult(verifiedUrl);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderCode}/cancel")
    public ResponseEntity<ApiResponse<String>> cancelPayment(
            @PathVariable long orderCode,
            @RequestParam(required = false) String reason
    ) {
        payOSService.cancelPayment(orderCode, reason);

        ApiResponse<String> response = new ApiResponse<>();
        response.setMessage("Cancel payment success");
        response.setResult("CANCELED");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<PaymentLinkData>> getPaymentInfo(@PathVariable long orderCode) {
        PaymentLinkData info = payOSService.getPaymentInfo(orderCode);

        ApiResponse<PaymentLinkData> response = new ApiResponse<>();
        response.setMessage("get payment info success");
        response.setResult(info);

        return ResponseEntity.ok(response);
    }
}
