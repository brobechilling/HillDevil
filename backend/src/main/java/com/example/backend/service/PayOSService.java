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
import java.util.Arrays;
import java.util.UUID;

@Service
public class PayOSService {

    private final PayOS payOS;
    private final PayOSConfig config;

    public PayOSService(PayOSConfig config) {
        this.config = config;
        this.payOS = new PayOS(config.getClientId(), config.getApiKey(), config.getChecksumKey());
    }

    public CheckoutResponseData createPayment(
            BigDecimal amount,
            Long orderCode,
            String itemName,
            int quantity,
            String description
    ) {
        try {
            long safeOrderCode = (orderCode != null && orderCode > 0)
                    ? orderCode
                    : Math.abs(UUID.randomUUID().getMostSignificantBits());

            System.out.println("[PayOS] Creating payment link for orderCode=" + safeOrderCode);

            ItemData itemData = ItemData.builder()
                    .name(itemName != null ? itemName : "Subscription Plan")
                    .quantity(quantity > 0 ? quantity : 1)
                    .price(amount.intValueExact()) // safer conversion
                    .build();

            PaymentData paymentData = PaymentData.builder()
                    .orderCode(safeOrderCode)
                    .amount(amount.intValueExact())
                    .description(description != null ? description : "Subscription Payment")
                    .returnUrl(config.getReturnUrl())
                    .cancelUrl(config.getCancelUrl())
                    .items(Arrays.asList(itemData))
                    .build();

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
