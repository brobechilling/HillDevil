package com.example.backend.service;

import com.example.backend.configuration.PayOSConfig;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import vn.payos.type.PaymentLinkData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

import java.math.BigDecimal;
import java.util.Collections;

@Service
public class PayOSService {

    private final PayOS payOS;
    private final PayOSConfig config;

    public PayOSService(PayOSConfig config) {
        this.config = config;
        this.payOS = new PayOS(config.getClientId(), config.getApiKey(), config.getChecksumKey());
    }

    public CheckoutResponseData createPaymentLink(
            BigDecimal amount,
            long orderCode,
            String itemName,
            int quantity,
            String description
    ) {
        try {
            ItemData itemData = ItemData.builder()
                    .name(itemName)
                    .quantity(quantity)
                    .price(amount.intValueExact())
                    .build();

            PaymentData paymentData = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(amount.intValueExact())
                    .description(description)
                    .returnUrl(config.getReturnUrl())
                    .cancelUrl(config.getCancelUrl())
                    .items(Collections.singletonList(itemData))
                    .build();

            System.out.println("[PayOS] Creating payment link with orderCode=" + orderCode);
            CheckoutResponseData response = payOS.createPaymentLink(paymentData);
            System.out.println("[PayOS] Checkout URL: " + response.getCheckoutUrl());
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_ERROR);
        }
    }

    public PaymentLinkData getPaymentInfo(long orderCode) {
        try {
            return payOS.getPaymentLinkInformation(orderCode);
        } catch (Exception e) {
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_ERROR);
        }
    }

    public void cancelPayment(long orderCode, String reason) {
        try {
            payOS.cancelPaymentLink(orderCode, reason != null ? reason : "User canceled");
        } catch (Exception e) {
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_ERROR);
        }
    }

    public String confirmWebhook(String webhookUrl) {
        try {
            return payOS.confirmWebhook(webhookUrl);
        } catch (Exception e) {
            throw new AppException(ErrorCode.PAYMENT_GATEWAY_ERROR);
        }
    }

    public WebhookData verifyWebhook(Webhook webhookBody) {
        try {
            return payOS.verifyPaymentWebhookData(webhookBody);
        } catch (Exception e) {
            throw new AppException(ErrorCode.PAYMENT_SIGNATURE_VERIFY_FAILED);
        }
    }
}
