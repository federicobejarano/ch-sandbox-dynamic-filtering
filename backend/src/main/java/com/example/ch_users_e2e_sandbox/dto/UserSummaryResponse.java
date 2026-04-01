package com.example.ch_users_e2e_sandbox.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

import com.example.ch_users_e2e_sandbox.entity.User;

public record UserSummaryResponse(
        Long id,
        String name,
        String email,
        String lineageType,
        String location,
        LocalDate birthDate,
        LocalDateTime createdAt) {

    public static UserSummaryResponse fromEntity(User user) {
        Objects.requireNonNull(user, "La entidad User no puede ser null.");

        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getLineageType().name(),
                user.getLocation(),
                user.getBirthDate(),
                user.getCreatedAt());
    }
}
