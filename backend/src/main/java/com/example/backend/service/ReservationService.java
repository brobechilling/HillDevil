package com.example.backend.service;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.request.CreateReservationRequest;
import com.example.backend.dto.response.ReservationResponse;
import com.example.backend.mapper.ReservationMapper;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Reservation;
import com.example.backend.entities.ReservationStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.AreaTableRepository;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.ReservationRepository;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BranchRepository branchRepository;
    private final AreaTableRepository areaTableRepository;
    private final ReservationMapper reservationMapper;

    public ReservationService(ReservationRepository reservationRepository, BranchRepository branchRepository,
            AreaTableRepository areaTableRepository,
            ReservationMapper reservationMapper) {
        this.reservationRepository = reservationRepository;
        this.branchRepository = branchRepository;
        this.areaTableRepository = areaTableRepository;
        this.reservationMapper = reservationMapper;
    }

    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest req) {
        Branch branch = branchRepository.findById(req.getBranchId())
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        AreaTable t = null;
        if (req.getAreaTableId() != null) {
            t = areaTableRepository.findById(req.getAreaTableId())
                    .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
        }

        Reservation r = reservationMapper.toEntity(req);
        r.setBranch(branch);
        r.setAreaTable(t);

        if (r.getStatus() == null) {
            r.setStatus(ReservationStatus.PENDING);
        }

        r = reservationRepository.save(r);

        ReservationResponse resp = reservationMapper.toDto(r);
        return resp;
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservation(UUID id) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESERVATION_NOT_FOUND));

        return reservationMapper.toDto(r);
    }

    @Transactional(readOnly = true)
    public Page<ReservationResponse> getReservationsByBranch(UUID branchId, int page, int size, String sort) {
        Sort s = Sort.by(Sort.Direction.ASC, "startTime");
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",", 2);
            Sort.Direction dir = (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())) ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            s = Sort.by(dir, parts[0].trim());
        }
        Pageable pageable = PageRequest.of(page, size, s);
        return reservationRepository.findAllByBranch_BranchId(branchId, pageable).map(reservationMapper::toDto);
    }

    @Transactional
    public ReservationResponse updateStatus(UUID reservationId, ReservationStatus newStatus) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESERVATION_NOT_FOUND));

        r.setStatus(newStatus);
        r = reservationRepository.save(r);

        ReservationResponse resp = reservationMapper.toDto(r);
        return resp;
    }

    @Transactional
    public void deleteReservation(UUID reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new AppException(ErrorCode.RESERVATION_NOT_FOUND));
        // Soft delete: mark as CANCELLED rather than physical delete
        r.setStatus(ReservationStatus.CANCELLED);
        r = reservationRepository.save(r);
    }

}
