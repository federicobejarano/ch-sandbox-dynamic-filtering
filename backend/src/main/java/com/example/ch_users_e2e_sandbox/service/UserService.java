package com.example.ch_users_e2e_sandbox.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.ch_users_e2e_sandbox.dto.UserSummaryResponse;
import com.example.ch_users_e2e_sandbox.dto.UserRegistrationRequest;
import com.example.ch_users_e2e_sandbox.dto.UserRegistrationResponse;
import com.example.ch_users_e2e_sandbox.entity.LineageType;
import com.example.ch_users_e2e_sandbox.entity.User;
import com.example.ch_users_e2e_sandbox.repository.UserRepository;
import com.example.ch_users_e2e_sandbox.specification.UserSpecification;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = Objects.requireNonNull(userRepository, "UserRepository no puede ser null.");
    }

    public UserRegistrationResponse registerUser(UserRegistrationRequest request) {
        Objects.requireNonNull(request, "UserRegistrationRequest no puede ser null.");

        User userToPersist = mapToEntity(request);
        User savedUser = userRepository.save(userToPersist);

        return UserRegistrationResponse.fromEntity(savedUser);
    }

    public List<UserRegistrationResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserRegistrationResponse::fromEntity)
                .toList();
    }

    public Page<UserSummaryResponse> searchUsers(
            String name,
            String location,
            LineageType lineageType,
            Integer minAge,
            Integer maxAge,
            Pageable pageable) {
        Objects.requireNonNull(pageable, "Pageable no puede ser null.");

        Specification<User> specification = Specification.where((Specification<User>) null)
                .and(UserSpecification.hasNameContaining(name))
                .and(UserSpecification.hasLocation(location))
                .and(UserSpecification.hasLineageType(lineageType))
                .and(UserSpecification.hasAgeBetween(minAge, maxAge));

        return userRepository.findAll(specification, pageable)
                .map(UserSummaryResponse::fromEntity);
    }

    private User mapToEntity(UserRegistrationRequest request) {
        return new User(
                request.name(),
                request.email(),
                resolveLineageType(request.lineageType()),
                request.location(),
                request.birthDate(),
                currentTimestamp());
    }

    private LineageType resolveLineageType(String lineageType) {
        String normalizedValue = toUpperCase(lineageType);

        try {
            return LineageType.valueOf(normalizedValue);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "El valor de lineageType es invalido. Valores permitidos: DESCENDANT, PHILHELLENE.");
        }
    }

    private String toUpperCase(String value) {
        return value != null ? value.toUpperCase(Locale.ROOT) : null;
    }

    private LocalDateTime currentTimestamp() {
        return LocalDateTime.now();
    }
}
