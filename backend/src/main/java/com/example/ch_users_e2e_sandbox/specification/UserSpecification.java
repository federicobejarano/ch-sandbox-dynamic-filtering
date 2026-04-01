package com.example.ch_users_e2e_sandbox.specification;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.example.ch_users_e2e_sandbox.entity.LineageType;
import com.example.ch_users_e2e_sandbox.entity.User;

import jakarta.persistence.criteria.Predicate;

/**
 * Factory methods para construir predicados dinamicos sobre {@link User}.
 */
public final class UserSpecification {

    private UserSpecification() {
        // Utility class.
    }

    public static Specification<User> hasNameContaining(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.isBlank()) {
                return null;
            }

            String normalizedPattern = "%" + name.trim().toLowerCase() + "%";
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.<String>get("name")),
                    normalizedPattern);
        };
    }

    public static Specification<User> hasLineageType(LineageType lineageType) {
        return (root, query, criteriaBuilder) -> {
            if (lineageType == null) {
                return null;
            }

            return criteriaBuilder.equal(root.get("lineageType"), lineageType);
        };
    }

    public static Specification<User> hasLocation(String location) {
        return (root, query, criteriaBuilder) -> {
            if (location == null || location.isBlank()) {
                return null;
            }

            return criteriaBuilder.equal(root.<String>get("location"), location.trim());
        };
    }

    public static Specification<User> hasAgeBetween(Integer minAge, Integer maxAge) {
        return (root, query, criteriaBuilder) -> {
            if (minAge == null && maxAge == null) {
                return null;
            }

            Predicate minAgePredicate = null;
            Predicate maxAgePredicate = null;
            LocalDate today = LocalDate.now();

            if (minAge != null) {
                LocalDate maxBirthDate = today.minusYears(minAge);
                minAgePredicate = criteriaBuilder.lessThanOrEqualTo(
                        root.<LocalDate>get("birthDate"),
                        maxBirthDate);
            }

            if (maxAge != null) {
                LocalDate minBirthDate = today.minusYears(maxAge.longValue() + 1).plusDays(1);
                maxAgePredicate = criteriaBuilder.greaterThanOrEqualTo(
                        root.<LocalDate>get("birthDate"),
                        minBirthDate);
            }

            if (minAgePredicate != null && maxAgePredicate != null) {
                return criteriaBuilder.and(minAgePredicate, maxAgePredicate);
            }

            return minAgePredicate != null ? minAgePredicate : maxAgePredicate;
        };
    }
}
