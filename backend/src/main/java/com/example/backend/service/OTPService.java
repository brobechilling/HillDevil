package com.example.backend.service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class OTPService {

    private static final String OTP_PREFIX = "otp:";
    private static final int OTP_TTL_MINUTES = 1;
    
    private final StringRedisTemplate stringRedisTemplate;

    public OTPService(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public String generateOTPCode(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        String key = OTP_PREFIX + email;
        stringRedisTemplate.opsForValue().set(key, otp, OTP_TTL_MINUTES, TimeUnit.MINUTES);
        return otp;
    }

    public boolean validateOTPCode(String otp, String email) {
        String key = OTP_PREFIX + email;
        String storedOTP = stringRedisTemplate.opsForValue().get(key);
        if (storedOTP != null && storedOTP.equals(otp)) {
            return stringRedisTemplate.delete(key);
        }
        return false;
    }

}
