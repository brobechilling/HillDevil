package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.service.PayOSService;
import com.example.backend.service.SubscriptionPaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class SubscriptionPaymentController {

    private final SubscriptionPaymentService subscriptionPaymentService;
    private final PayOSService payOSService;
    private final ObjectMapper objectMapper;

    public SubscriptionPaymentController(
            SubscriptionPaymentService subscriptionPaymentService,
            PayOSService payOSService,
            ObjectMapper objectMapper
    ) {
        this.subscriptionPaymentService = subscriptionPaymentService;
        this.payOSService = payOSService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/create")
    public ApiResponse<SubscriptionPaymentResponse> createPayment(
            @RequestParam UUID subscriptionId,
            @RequestParam BigDecimal amount
    ) {
        SubscriptionPaymentResponse result =
                subscriptionPaymentService.createPayment(subscriptionId, amount);

        ApiResponse<SubscriptionPaymentResponse> response = new ApiResponse<>();
        response.setResult(result);
        response.setMessage("Tạo yêu cầu thanh toán thành công");
        return response;
    }

    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<String>> handleWebhook(
            @RequestHeader("x-signature") String signature,
            @RequestBody String rawPayload
    ) {
        ApiResponse<String> response = new ApiResponse<>();

        //verify signature
        if (!payOSService.verifySignature(rawPayload, signature)) {
            response.setMessage("Chữ ký không hợp lệ");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Parse payload JSON
            JsonNode root = objectMapper.readTree(rawPayload);
            JsonNode data = root.path("data");

            long orderCode = data.path("orderCode").asLong(0);
            String status = data.path("status").asText("");

            if ("PAID".equalsIgnoreCase(status) && orderCode > 0) {
                subscriptionPaymentService.handlePaymentSuccess(orderCode);
                response.setMessage("Thanh toán thành công, đã kích hoạt subscription");
            } else {
                response.setMessage("Thanh toán không thành công hoặc đang chờ xử lý");
            }

            response.setResult("Webhook processed");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.setMessage("Lỗi xử lý webhook: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
