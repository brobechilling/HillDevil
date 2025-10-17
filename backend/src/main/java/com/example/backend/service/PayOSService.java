package com.example.backend.service;

import com.example.backend.configuration.PayOSConfig;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
public class PayOSService {

    private final PayOSConfig config;
    private final RestTemplate restTemplate = new RestTemplate();

    public PayOSService(PayOSConfig config) {
        this.config = config;
    }

    public Map<String, Object> createPayment(BigDecimal amount, Long orderCode, String description) {
        String url = config.getBaseUrl() + "/v2/payment-requests";

        // Payload JSON (orderCode is integer type, it can be null so it should be wrapper Long in entity)
        var payload = Map.<String, Object>of(
                "orderCode", orderCode,
                "amount", amount,
                "description", description,
                "returnUrl", config.getReturnUrl(),
                "cancelUrl", config.getCancelUrl()
        );

        // Header bảo mật PayOS
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", config.getClientId());
        headers.set("x-api-key", config.getApiKey());

        HttpEntity<Object> entity = new HttpEntity<>(payload, headers);

        // Gửi request
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getBody() == null || !response.getStatusCode().is2xxSuccessful()) {
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_ERROR);
        }

        Object dataObj = response.getBody().get("data");
        if (!(dataObj instanceof Map)) {
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_ERROR);
        }

        //noinspection unchecked
        return (Map<String, Object>) dataObj;
    }

    public boolean verifySignature(String rawPayload, String incomingSignature) {
        try {
            String key = config.getChecksumKey();
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] macData = sha256_HMAC.doFinal(rawPayload.getBytes(StandardCharsets.UTF_8));
            String computed = Base64.getEncoder().encodeToString(macData);

            return computed.equals(incomingSignature);
        } catch (Exception ex) {
            throw new AppException(ErrorCode.PAYMENT_SIGNATURE_VERIFY_FAILED);
        }
    }
}
