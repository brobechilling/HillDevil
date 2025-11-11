package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.CreateReservationRequest;
import com.example.backend.dto.response.ReservationResponse;
import com.example.backend.entities.ReservationStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.service.ReservationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    // Public (guest) create reservation
    @PostMapping("/public/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReservationResponse> createPublic(@Valid @RequestBody CreateReservationRequest req) {
        ApiResponse<ReservationResponse> res = new ApiResponse<>();
        res.setResult(reservationService.createReservation(req));
        return res;
    }

    // Receptionist: create reservation (authenticated)
    @PostMapping("/receptionist/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReservationResponse> createForReceptionist(@Valid @RequestBody CreateReservationRequest req) {
        ApiResponse<ReservationResponse> res = new ApiResponse<>();
        res.setResult(reservationService.createReservation(req));
        return res;
    }

    // Receptionist: list reservations by branch
    @GetMapping("/receptionist/reservations")
    public ApiResponse<Page<ReservationResponse>> getByBranch(
            @RequestParam UUID branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {
        ApiResponse<Page<ReservationResponse>> res = new ApiResponse<>();
        res.setResult(reservationService.getReservationsByBranch(branchId, page, size, sort));
        return res;
    }

    // Receptionist: get reservation by id
    @GetMapping("/receptionist/reservations/{id}")
    public ApiResponse<ReservationResponse> getById(@PathVariable UUID id) {
        ApiResponse<ReservationResponse> res = new ApiResponse<>();
        res.setResult(reservationService.getReservation(id));
        return res;
    }

    // Public: get reservations assigned to a specific table
    @GetMapping("/public/reservations/table/{tableId}")
    public ApiResponse<List<ReservationResponse>> getReservationsByTable(@PathVariable UUID tableId) {
        ApiResponse<List<ReservationResponse>> res = new ApiResponse<>();
        res.setResult(reservationService.getReservationsByTable(tableId));
        return res;
    }

    @PutMapping("/receptionist/reservations/{id}/status")
    public ApiResponse<ReservationResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam ReservationStatus status) {

        if (status == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        ApiResponse<ReservationResponse> res = new ApiResponse<>();
        res.setResult(reservationService.updateStatus(id, status));
        return res;
    }

    // Receptionist: assign / update table for a reservation
    @PutMapping("/receptionist/reservations/{id}/table")
    public ApiResponse<ReservationResponse> assignTable(
            @PathVariable UUID id,
            @RequestParam(required = false) UUID tableId) {
        ApiResponse<ReservationResponse> res = new ApiResponse<>();
        res.setResult(reservationService.assignTable(id, tableId));
        return res;
    }

    @DeleteMapping("/receptionist/reservations/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        reservationService.deleteReservation(id);
    }
}
