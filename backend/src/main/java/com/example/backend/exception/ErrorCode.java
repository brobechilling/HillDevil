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
    TOKEN_INVALID(1008, "The refresh token not exist in db", HttpStatus.BAD_REQUEST),
    TOKEN_EXPIRED(1009, "The refresh token already expired or used", HttpStatus.BAD_REQUEST),
    //Subcriptions handling error: Khoi
    PACKAGE_NOTEXISTED(1010, "The package does not exist", HttpStatus.INTERNAL_SERVER_ERROR),
    FEATURE_NOTEXISTED(1011, "The feature does not exist", HttpStatus.INTERNAL_SERVER_ERROR),
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
