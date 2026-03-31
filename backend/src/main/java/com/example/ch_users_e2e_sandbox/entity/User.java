package com.example.ch_users_e2e_sandbox.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_lineage_type", columnList = "lineage_type"),
                @Index(name = "idx_location", columnList = "location"),
                @Index(name = "idx_birth_date", columnList = "birth_date")
        })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "lineage_type", nullable = false, length = 20)
    private LineageType lineageType;

    @Column(nullable = false, length = 100)
    private String location;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    protected User() {
        // Constructor requerido por JPA para instanciacion via reflection.
    }

    public User(
            String name,
            String email,
            LineageType lineageType,
            String location,
            LocalDate birthDate,
            LocalDateTime createdAt) {
        this.name = name;
        this.email = email;
        this.lineageType = lineageType;
        this.location = location;
        this.birthDate = birthDate;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LineageType getLineageType() {
        return lineageType;
    }

    public void setLineageType(LineageType lineageType) {
        this.lineageType = lineageType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
