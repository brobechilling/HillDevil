package com.example.backend.exception;

import java.util.NoSuchElementException;

import org.hibernate.LazyInitializationException;
import org.springframework.http.ResponseEntity;
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

    // handle LazyInitializationException (Hibernate lazy loading issue)
    @ExceptionHandler(value = LazyInitializationException.class)
    ResponseEntity<ApiResponse<Void>> handleLazyInitializationException(LazyInitializationException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.WE_COOKED.getCode());
        apiResponse.setMessage("Data loading error: " + e.getMessage());
        return ResponseEntity.status(ErrorCode.WE_COOKED.getStatusCode()).body(apiResponse);
    }

    // handle NoSuchElementException (e.g., table not found)
    @ExceptionHandler(value = NoSuchElementException.class)
    ResponseEntity<ApiResponse<Void>> handleNoSuchElementException(NoSuchElementException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.TABLE_NOT_FOUND.getCode());
        apiResponse.setMessage(e.getMessage());
        return ResponseEntity.status(ErrorCode.TABLE_NOT_FOUND.getStatusCode()).body(apiResponse);
    }

    // handle IllegalArgumentException (e.g., invalid UUID, table doesn't belong to branch)
    @ExceptionHandler(value = IllegalArgumentException.class)
    ResponseEntity<ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException e) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.INVALID_REQUEST.getCode());
        apiResponse.setMessage(e.getMessage());
        return ResponseEntity.status(ErrorCode.INVALID_REQUEST.getStatusCode()).body(apiResponse);
    }

     // handle unexpected exception
    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse<Void>> handleUncategorizedException(Exception e) {
        // Log exception for debugging
        System.err.println("GlobalExceptionHandler caught exception: " + e.getClass().getName());
        System.err.println("Message: " + e.getMessage());
        e.printStackTrace();
        
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.WE_COOKED.getCode());
        apiResponse.setMessage(ErrorCode.WE_COOKED.getMessage());
        return ResponseEntity.status(ErrorCode.WE_COOKED.getStatusCode()).body(apiResponse);
    }
    
}
