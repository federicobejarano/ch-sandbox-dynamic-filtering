package com.example.ch_users_e2e_sandbox.dto;

import java.time.LocalDate;
import java.util.Locale;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public record UserRegistrationRequest(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres.")
        String name,

        @NotBlank(message = "El email es obligatorio.")
        @Email(message = "El email debe tener un formato valido.")
        String email,

        @NotBlank(message = "El lineageType es obligatorio.")
        String lineageType,

        @NotBlank(message = "La ubicacion es obligatoria.")
        String location,

        @NotNull(message = "La fecha de nacimiento es obligatoria.")
        @Past(message = "La fecha de nacimiento debe ser anterior a la fecha actual.")
        LocalDate birthDate) {

    public UserRegistrationRequest {
        name = name != null ? name.trim() : null;
        email = email != null ? email.trim().toLowerCase(Locale.ROOT) : null;
        lineageType = lineageType != null ? lineageType.trim() : null;
        location = location != null ? location.trim() : null;
    }
}
