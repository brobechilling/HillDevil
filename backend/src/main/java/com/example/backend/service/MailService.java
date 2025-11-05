package com.example.backend.service;

import org.springframework.web.client.RestClient;

import com.example.backend.dto.request.OTPMailRequest;
import com.example.backend.dto.request.OTPValidateMailRequest;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final String OTP_SENDER_NAME = "nhacaidentuchauau";
    private static final String OTP_SENDER_EMAIL = "wuocnguyenn@gmail.com";

    private final RestClient restClient;
    private final OTPService otpService;

    public MailService(@Value("${brevo.mail_base_url}") String baseUrl, @Value("${brevo.api_key}") String apiKey, OTPService otpService) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("accept", "application/json")
                .defaultHeader("api-key", apiKey) 
                .build();
        this.otpService = otpService;
    }

    public void sendEmail() {
        Map<String, Object> requestBody = Map.of(
            "sender", Map.of(
                "email", "wuocnguyenn@gmail.com",
                "name", OTP_SENDER_NAME
            ),
            "to", List.of(Map.of(
                "email", "quocnguyen112505@gmail.com",
                "name", "quoc"
            )),
            "htmlContent", "<p>test send mail from controller</p>",
            "subject", "test mail service",
            "replyTo", Map.of(
                "email", "wuocnguyenn@gmail.com",
                "name", "wuoc"
            )
        );

        var response = restClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .toEntity(String.class);

    }
    
    public void sendOTPMail(OTPMailRequest otpMailRequest) {
        String otp = otpService.generateOTPCode(otpMailRequest.getMail());
        String htmlContent = String.format(
            "<p>Your OTP code is: <b>%s</b></p>" +
            "<p>This code will expire in 1 minutes.</p>", otp
        );
        Map<String, Object> requestBody = Map.of(
            "sender", Map.of(
                "email", OTP_SENDER_EMAIL,
                "name", OTP_SENDER_NAME
            ),
            "to", List.of(Map.of(
                "email", otpMailRequest.getMail(),
                "name", otpMailRequest.getName()
            )),
            "htmlContent", htmlContent,
            "subject", "RESET PASSWORD VALIDATION"
        );

        ResponseEntity<String> response = restClient.post() 
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .toEntity(String.class);

    }

    public boolean checkOTP(OTPValidateMailRequest otpValidateMailRequest) {
        return otpService.validateOTPCode(otpValidateMailRequest.getOtp(), otpValidateMailRequest.getEmail());
    }
}
