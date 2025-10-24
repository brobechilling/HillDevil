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

import java.util.Collections;

@Service
public class PayOSService {

    private final PayOS payOS;
    private final PayOSConfig config;

    public PayOSService(PayOSConfig config) {
        this.config = config;
        this.payOS = new PayOS(config.getClientId(), config.getApiKey(), config.getChecksumKey());
    }

    public CheckoutResponseData createVQRPayment(Integer amount, long orderCode, String itemName, String description) {
        try {
            ItemData item = ItemData.builder()
                    .name(itemName)
                    .quantity(1)
                    .price(amount)
                    .build();

            PaymentData paymentData = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(amount)
                    .description(description)
                    .returnUrl(config.getReturnUrl())
                    .cancelUrl(config.getCancelUrl())
                    .items(Collections.singletonList(item))
                    .build();

            return payOS.createPaymentLink(paymentData);
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

    public WebhookData verifyWebhook(Webhook webhookBody) {
        try {
            return payOS.verifyPaymentWebhookData(webhookBody);
        } catch (Exception e) {
            throw new AppException(ErrorCode.PAYMENT_SIGNATURE_VERIFY_FAILED);
        }
    }
}
