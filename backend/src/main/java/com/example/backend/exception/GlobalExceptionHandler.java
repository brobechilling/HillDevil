package com.example.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.example.backend.dto.ApiResponse;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<Void>> handleAppException(AppException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(e.getErrorCode().getCode());
        apiResponse.setMessage(e.getErrorCode().getMessage());
        return ResponseEntity.status(e.getErrorCode().getStatusCode()).body(apiResponse);
    }

    // handle spring validation exception
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.VALIDATION_VIOLATED.getCode());
        apiResponse.setMessage(ErrorCode.VALIDATION_VIOLATED.getMessage() + " " + e.getFieldError().getDefaultMessage());
        return ResponseEntity.status(ErrorCode.VALIDATION_VIOLATED.getStatusCode()).body(apiResponse);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.UNAUTHORIZED.getCode());
        apiResponse.setMessage(ErrorCode.UNAUTHORIZED.getMessage());
        return ResponseEntity.status(ErrorCode.UNAUTHORIZED.getStatusCode()).body(apiResponse);
    }


    // handle unexpected exception
    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<Void>> handleUncategorizedException(Exception e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.WE_COOKED.getCode());
        apiResponse.setMessage(ErrorCode.WE_COOKED.getMessage());
        return ResponseEntity.status(ErrorCode.WE_COOKED.getStatusCode()).body(apiResponse);
    }

    
}
