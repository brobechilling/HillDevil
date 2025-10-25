package com.example.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {

    USER_EXISTED(1001, "User already existed", HttpStatus.BAD_REQUEST),
    USER_NOTEXISTED(1002, "User not existed", HttpStatus.NOT_FOUND),
    VALIDATION_VIOLATED(1003, "Violate valiadtion:", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1004,"Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1005,"You do not have permission", HttpStatus.FORBIDDEN),
    JWT_EXCEPTION(1006, "Jwt handling exception", HttpStatus.INTERNAL_SERVER_ERROR),
    ROLE_NOTEXISTED(1007, "The role not exist", HttpStatus.INTERNAL_SERVER_ERROR),
    TOKEN_INVALID(1008, "The refresh token not exist in db", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(1009, "The refresh token already expired", HttpStatus.UNAUTHORIZED),
    TOKEN_REUSED(2009, "The refresh token already used", HttpStatus.UNAUTHORIZED),
    //Subcriptions handling error: Khoi
    PACKAGE_NOTEXISTED(1010, "The package does not exist", HttpStatus.INTERNAL_SERVER_ERROR),
    FEATURE_NOTEXISTED(1011, "The feature does not exist", HttpStatus.INTERNAL_SERVER_ERROR),
    FEATURE_NOTEXISTED_IN_PACKAGE(1012, "The feature does not exist in this package", HttpStatus.INTERNAL_SERVER_ERROR),
    PACKAGE_NAME_EXISTED(1013, "Package name already exists", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(1014, "Payment not found", HttpStatus.NOT_FOUND),
    PAYMENT_GATEWAY_ERROR(1015, "Payment Gateway Error", HttpStatus.INTERNAL_SERVER_ERROR),
    PAYMENT_SIGNATURE_VERIFY_FAILED(1016, "Payment Signature Verification Failed", HttpStatus.BAD_REQUEST),
    SUBSCRIPTION_NOT_FOUND(1017, "Subscription not found", HttpStatus.NOT_FOUND),
    SUBSCRIPTION_NOT_ACTIVE(1018, "Subscription not active", HttpStatus.BAD_REQUEST),
    ORDER_CODE_EXISTS(1019, "Order code already exists", HttpStatus.BAD_REQUEST),
    PAYMENT_CREATION_FAILED(1020, "Payment creation failed", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(4000, "Invalid request", HttpStatus.BAD_REQUEST),
    
    // Table handling errors
    TABLE_NOT_FOUND(2001, "Table not found", HttpStatus.NOT_FOUND),
    AREA_NOT_FOUND(2002, "Area not found", HttpStatus.NOT_FOUND),
    AREA_NOT_OWNED_BY_USER(2003, "Area does not belong to this owner", HttpStatus.FORBIDDEN),
    TABLE_TAG_EXISTED_IN_AREA(2004, "Table tag already exists in this area", HttpStatus.BAD_REQUEST),
    INVALID_TABLE_STATUS(2005, "Invalid table status", HttpStatus.BAD_REQUEST),
    
    PAYMENT_WEBHOOK_FAILED(1019, "Payment Webhook Failed", HttpStatus.INTERNAL_SERVER_ERROR),
    FEATURE_NAME_EMPTY(1020, "Feature name is empty", HttpStatus.BAD_REQUEST),
    PAYMENT_CANNOT_CANCEL(1021, "Payment cannot cancel", HttpStatus.BAD_REQUEST),
    // Restaurant error
    RESTAURANT_NOTEXISTED(3000, "Restaurant not existed", HttpStatus.NOT_FOUND),
    STAFFACCOUNT_NOTEXISTED(4001, "StaffAccount not existed", HttpStatus.NOT_FOUND),
    BRANCH_NOTEXISTED(3001, "Branch not existed", HttpStatus.NOT_FOUND),
    AUTHENTICATION_INVALID(9000, "Authentication request invalid, missing email or username", HttpStatus.BAD_REQUEST),
    WE_COOKED(9999, "oh shit - we get unexpected exception", HttpStatus.INTERNAL_SERVER_ERROR);

    private int code;
    private String message;
    private HttpStatusCode statusCode;

    private ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }

}