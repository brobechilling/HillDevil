package com.example.backend.service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.request.AuthenticationRequest;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.RefreshResponse;
import com.example.backend.entities.InvalidJwtToken;
import com.example.backend.entities.RefreshToken;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.InvalidJwtTokenRepository;
import com.example.backend.repository.RefreshTokenRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.TokenUtils;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;


@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final InvalidJwtTokenRepository invalidJwtTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private Logger logger = LoggerFactory.getLogger(getClass());

    @Value("${jwt.signer-key}")
    private String signerKey;
    @Value("${jwt.valid-duration}")
    private long validDuration;
    @Value("${jwt.refreshable-duration}")
    private long refreshableDuration;
    @Value("${jwt.issuer}")
    private String issuer;
    
    
    public AuthenticationService(UserRepository userRepository, InvalidJwtTokenRepository invalidJwtTokenRepository, PasswordEncoder passwordEncoder, RefreshTokenRepository refreshTokenRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.invalidJwtTokenRepository = invalidJwtTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.userMapper = userMapper;
    }

    public AuthenticationResponse authenticate(AuthenticationRequest authenticationRequest, String clientIp, String userAgent) {
        User user = userRepository.findByEmail(authenticationRequest.getEmail()).orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));
        boolean isAuthenticated = passwordEncoder.matches(authenticationRequest.getPassword(), user.getPassword());
        if (!isAuthenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user, clientIp, userAgent, null);
        AuthenticationResponse authenticationResponse = new AuthenticationResponse();
        authenticationResponse.setAccessToken(accessToken);
        authenticationResponse.setRefreshToken(refreshToken);
        authenticationResponse.setUser(userMapper.toUserDto(user));
        return authenticationResponse;
    }

    private String generateAccessToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                                                    .subject(user.getUserId().toString())
                                                    .issuer(issuer)
                                                    .issueTime(new Date())
                                                    .expirationTime(new Date(
                                                        Instant.now().plus(validDuration, ChronoUnit.SECONDS).toEpochMilli()
                                                    ))
                                                    .claim("scope", buildScope(user))
                                                    .jwtID(UUID.randomUUID().toString())
                                                    .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload); 
        try {
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } 
        catch (JOSEException e) {
            throw new RuntimeException();
        }
    }

    private String generateRefreshToken(User user, String clientIp, String userAgent, RefreshToken parentRefreshToken) {
        String raw = TokenUtils.generateRandomToken(48);
        logger.info("generate raw refresh token: " + raw);
        String hashed = TokenUtils.sha256Hex(raw);
        logger.info("generate hashed refresh token: " + hashed);
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setId(UUID.randomUUID().toString());
        refreshToken.setTokenHash(hashed);
        refreshToken.setUser(user);
        refreshToken.setIssuedAt(Instant.now());
        refreshToken.setExpiresAt(Instant.now().plus(refreshableDuration, ChronoUnit.SECONDS));
        refreshToken.setRevoked(false);
        refreshToken.setClientIp(clientIp);
        refreshToken.setUserAgent(userAgent);
        // if parentRefreshToken is null -> this refreshToken is generated when login 
        refreshToken.setParentRefreshToken(parentRefreshToken);
        refreshTokenRepository.save(refreshToken);

        // return raw token to client
        return raw; 
    }

    private String buildScope(User user) {
        StringBuilder scope = new StringBuilder("ROLE_");
        scope.append(user.getRole().getName());
        return scope.toString();
    }

    // verify access token
    public SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(signerKey.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        Instant expirationTime;
        if (isRefresh) 
        {
            expirationTime = signedJWT.getJWTClaimsSet().getIssueTime().toInstant().plus(refreshableDuration, ChronoUnit.SECONDS);
        }
        else 
        {
            expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime().toInstant();
        }
        boolean valid = expirationTime.isAfter(Instant.now()) && signedJWT.verify(verifier);
        // check in db
        boolean inDB = invalidJwtTokenRepository.findById(signedJWT.getJWTClaimsSet().getJWTID()).isPresent();
        if (valid && !inDB)
        {
            return signedJWT;    
        }
        else
        {
            // if not try catch then GlobalExceptionHandler will handle this exception
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }        
    }

    // refresh token rotation, issue new access and refresh
    public RefreshResponse refreshWithOpaqueToken(String rawRefreshToken, String clientIp, String userAgent) {
        String hash = TokenUtils.sha256Hex(rawRefreshToken);
        logger.info("check hesh refresh token from cookie: " + hash);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash).orElseThrow(() -> new AppException(ErrorCode.TOKEN_INVALID));
        if (stored.isRevoked()) {
            // token reused -> token replay attack?
            refreshTokenRepository.revokeAllByUserId(stored.getUser().getUserId());
            throw new AppException(ErrorCode.TOKEN_REUSED);
        }
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }
        // OPTIONAL: check clientIp/userAgent match stored -> additional security
        stored.setRevoked(true);
        User user = stored.getUser();
        String accessToken = generateAccessToken(user);
        String newRawRefreshToken = generateRefreshToken(user, clientIp, userAgent, stored);
        refreshTokenRepository.save(stored);
        RefreshResponse response = new RefreshResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(newRawRefreshToken);
        return response;
    }

    public void logoutByAccessToken(String accessToken) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(accessToken);
            String jwtId = signedJWT.getJWTClaimsSet().getJWTID();
            InvalidJwtToken invalidToken = new InvalidJwtToken();
            invalidToken.setId(jwtId);
            invalidToken.setExpirationTime(signedJWT.getJWTClaimsSet().getExpirationTime().toInstant());
            invalidJwtTokenRepository.save(invalidToken);
        } catch (ParseException e) {
            throw new AppException(ErrorCode.JWT_EXCEPTION);
        }
    }

    public void revokeRefreshToken(String rawRefreshToken) {
        String hash = TokenUtils.sha256Hex(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

}
