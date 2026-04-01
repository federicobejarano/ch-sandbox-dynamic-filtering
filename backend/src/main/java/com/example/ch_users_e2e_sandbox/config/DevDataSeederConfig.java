package com.example.ch_users_e2e_sandbox.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.example.ch_users_e2e_sandbox.entity.LineageType;
import com.example.ch_users_e2e_sandbox.entity.User;
import com.example.ch_users_e2e_sandbox.repository.UserRepository;

@Configuration
@Profile("dev")
public class DevDataSeederConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(DevDataSeederConfig.class);

    @Bean
    CommandLineRunner devDataSeeder(UserRepository userRepository) {
        return args -> {
            LOGGER.info("Iniciando data seeding para el perfil dev.");

            if (userRepository.count() > 0) {
                LOGGER.info("Data seeding omitido: la tabla users ya contiene registros.");
                return;
            }

            List<User> seedUsers = List.of(
                    seedUser(
                            "SOFIA KALOGERAKIS",
                            "sofia.kalogerakis@helenica.org",
                            LineageType.DESCENDANT,
                            "Resistencia",
                            LocalDate.of(1992, 4, 18),
                            LocalDateTime.of(2026, 3, 1, 9, 0)),
                    seedUser(
                            "NICOLAS PAPADOPOULOS",
                            "nicolas.papadopoulos@helenica.org",
                            LineageType.DESCENDANT,
                            "Corrientes",
                            LocalDate.of(1988, 10, 11),
                            LocalDateTime.of(2026, 3, 2, 9, 15)),
                    seedUser(
                            "ELENA PAPPAS",
                            "elena.pappas@helenica.org",
                            LineageType.DESCENDANT,
                            "Buenos Aires",
                            LocalDate.of(2008, 4, 1),
                            LocalDateTime.of(2026, 3, 3, 9, 30)),
                    seedUser(
                            "TOMAS COSTA",
                            "tomas.costa@example.com",
                            LineageType.PHILHELLENE,
                            "Resistencia",
                            LocalDate.of(2008, 4, 2),
                            LocalDateTime.of(2026, 3, 4, 9, 45)),
                    seedUser(
                            "MARIA GEORGIADIS",
                            "maria.georgiadis@helenica.org",
                            LineageType.DESCENDANT,
                            "Atenas",
                            LocalDate.of(1960, 7, 9),
                            LocalDateTime.of(2026, 3, 5, 10, 0)),
                    seedUser(
                            "LUCAS FERNANDEZ",
                            "lucas.fernandez@example.com",
                            LineageType.PHILHELLENE,
                            "Corrientes",
                            LocalDate.of(1999, 1, 15),
                            LocalDateTime.of(2026, 3, 6, 10, 15)),
                    seedUser(
                            "AGUSTINA STAVRIDOU",
                            "agustina.stavridou@helenica.org",
                            LineageType.DESCENDANT,
                            "Buenos Aires",
                            LocalDate.of(1978, 3, 30),
                            LocalDateTime.of(2026, 3, 7, 10, 30)),
                    seedUser(
                            "BRUNO LOPEZ",
                            "bruno.lopez@example.com",
                            LineageType.PHILHELLENE,
                            "Resistencia",
                            LocalDate.of(2011, 12, 5),
                            LocalDateTime.of(2026, 3, 8, 10, 45)),
                    seedUser(
                            "VALERIA PAPATHANASIOU",
                            "valeria.papathanasiou@helenica.org",
                            LineageType.DESCENDANT,
                            "Atenas",
                            LocalDate.of(1995, 6, 20),
                            LocalDateTime.of(2026, 3, 9, 11, 0)),
                    seedUser(
                            "DIEGO ROMERO",
                            "diego.romero@example.com",
                            LineageType.PHILHELLENE,
                            "Buenos Aires",
                            LocalDate.of(1983, 11, 3),
                            LocalDateTime.of(2026, 3, 10, 11, 15)),
                    seedUser(
                            "IRINI SARRIS",
                            "irini.sarris@helenica.org",
                            LineageType.DESCENDANT,
                            "Corrientes",
                            LocalDate.of(1970, 2, 14),
                            LocalDateTime.of(2026, 3, 11, 11, 30)),
                    seedUser(
                            "CAMILA BENITEZ",
                            "camila.benitez@example.com",
                            LineageType.PHILHELLENE,
                            "Resistencia",
                            LocalDate.of(1990, 8, 25),
                            LocalDateTime.of(2026, 3, 12, 11, 45)),
                    seedUser(
                            "MATEO KARALIS",
                            "mateo.karalis@helenica.org",
                            LineageType.DESCENDANT,
                            "Buenos Aires",
                            LocalDate.of(2003, 9, 12),
                            LocalDateTime.of(2026, 3, 13, 12, 0)),
                    seedUser(
                            "JULIA NAVARRO",
                            "julia.navarro@example.com",
                            LineageType.PHILHELLENE,
                            "Atenas",
                            LocalDate.of(1964, 1, 28),
                            LocalDateTime.of(2026, 3, 14, 12, 15)),
                    seedUser(
                            "PETROS DASKALAKIS",
                            "petros.daskalakis@helenica.org",
                            LineageType.DESCENDANT,
                            "Corrientes",
                            LocalDate.of(1958, 5, 16),
                            LocalDateTime.of(2026, 3, 15, 12, 30)),
                    seedUser(
                            "LUCIA GOMEZ",
                            "lucia.gomez@example.com",
                            LineageType.PHILHELLENE,
                            "Buenos Aires",
                            LocalDate.of(2006, 10, 10),
                            LocalDateTime.of(2026, 3, 16, 12, 45)),
                    seedUser(
                            "ANDRES PAPAS",
                            "andres.papas@helenica.org",
                            LineageType.DESCENDANT,
                            "Resistencia",
                            LocalDate.of(1985, 12, 1),
                            LocalDateTime.of(2026, 3, 17, 13, 0)),
                    seedUser(
                            "HELENA MITROPOULOS",
                            "helena.mitropoulos@helenica.org",
                            LineageType.DESCENDANT,
                            "Atenas",
                            LocalDate.of(1997, 3, 22),
                            LocalDateTime.of(2026, 3, 18, 13, 15)),
                    seedUser(
                            "FEDERICO RUIZ",
                            "federico.ruiz@example.com",
                            LineageType.PHILHELLENE,
                            "Corrientes",
                            LocalDate.of(1993, 7, 7),
                            LocalDateTime.of(2026, 3, 19, 13, 30)),
                    seedUser(
                            "KATERINA XANTHOPOULOU",
                            "katerina.xanthopoulou@helenica.org",
                            LineageType.DESCENDANT,
                            "Buenos Aires",
                            LocalDate.of(1975, 9, 17),
                            LocalDateTime.of(2026, 3, 20, 13, 45)),
                    seedUser(
                            "MARTINA SILVA",
                            "martina.silva@helenica.org",
                            LineageType.DESCENDANT,
                            "Resistencia",
                            LocalDate.of(1981, 4, 5),
                            LocalDateTime.of(2026, 3, 21, 14, 0)),
                    seedUser(
                            "YANNIS VOULGARIS",
                            "yannis.voulgaris@helenica.org",
                            LineageType.DESCENDANT,
                            "Atenas",
                            LocalDate.of(2004, 2, 29),
                            LocalDateTime.of(2026, 3, 22, 14, 15)),
                    seedUser(
                            "BELEN HERRERA",
                            "belen.herrera@example.com",
                            LineageType.PHILHELLENE,
                            "Corrientes",
                            LocalDate.of(1962, 12, 19),
                            LocalDateTime.of(2026, 3, 23, 14, 30)),
                    seedUser(
                            "SEBASTIAN RALLIS",
                            "sebastian.rallis@helenica.org",
                            LineageType.DESCENDANT,
                            "Buenos Aires",
                            LocalDate.of(1991, 1, 8),
                            LocalDateTime.of(2026, 3, 24, 14, 45)));

            userRepository.saveAll(seedUsers);
            LOGGER.info("Data seeding completado: {} usuarios insertados en users.", seedUsers.size());
        };
    }

    private static User seedUser(
            String name,
            String email,
            LineageType lineageType,
            String location,
            LocalDate birthDate,
            LocalDateTime createdAt) {
        return new User(name, email, lineageType, location, birthDate, createdAt);
    }
}
