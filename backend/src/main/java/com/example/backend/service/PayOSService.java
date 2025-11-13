package com.example.backend.service;

import com.example.backend.configuration.PayOSConfig;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.exception.PayOSException;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.WebhookData;
import vn.payos.model.webhooks.Webhook;

@Service
public class PayOSService {

    private final PayOS payOS;
    private final PayOSConfig config;

    public PayOSService(PayOSConfig config) {
        this.config = config;

        this.payOS = new PayOS(
                config.getClientId(),
                config.getApiKey(),
                config.getChecksumKey()
        );
    }

    public String buildReturnUrl(long orderCode) {
        return config.getReturnUrl() + "?orderCode=" + orderCode;
    }

    public CreatePaymentLinkResponse createVQRPayment(
            Long amount,
            long orderCode,
            String description,
            String returnUrl
    ) {
        try {
            CreatePaymentLinkRequest paymentRequest = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(amount)
                    .description(description)
                    .returnUrl(returnUrl)
                    .cancelUrl(config.getCancelUrl())
                    .build();

            return payOS.paymentRequests().create(paymentRequest);

        } catch (PayOSException e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_ERROR);
        }
    }

    public WebhookData verifyWebhook(Webhook webhookBody) {
        try {
            return payOS.webhooks().verify(webhookBody);
        } catch (Exception e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.PAYMENT_SIGNATURE_VERIFY_FAILED);
        }
    }
}
