# Spike 3: Filtrado Dinámico y Listado Paginado

Este repositorio contiene el tercer **Spike** de investigación para el proyecto **Colectividad Helénica Resistencia**. Partiendo del codebase validado en el primer spike (flujo E2E) y las conclusiones del segundo (reactividad local con Signals), este sandbox aborda el problema central del dashboard administrativo: la consulta dinámica de usuarios con múltiples filtros opcionales, paginación y renderizado incremental.

**Objetivo**
Validar empíricamente que **Spring Boot** puede recibir múltiples *query parameters* opcionales (nombre, localidad, tipo de linaje, rango de edad) y traducirlos en una consulta JPA dinámica y paginada, y que **Angular** puede construir, enviar y renderizar estos resultados mediante un pipeline reactivo con cancelación automática de requests y scroll infinito.

**Alcance y Casos de Uso**
El spike replica el ciclo de vida de una búsqueda administrativa de socios, implementando una cadena completa de filtrado y paginación que atraviesa tres ejes:
1.  **Composición dinámica de predicados:** Filtros por nombre (parcial, case-insensitive), tipo de linaje (`DESCENDANT` / `PHILHELLENE`), localidad (igualdad exacta) y rango de edad (traducción de años a límites de `LocalDate`), combinados con AND lógico en runtime.
2.  **Paginación con metadatos:** Respuestas `Page<T>` de Spring Data con `totalElements`, `totalPages`, `number`, `last`, consumidas por el frontend para controlar el scroll infinito.
3.  **Pipeline reactivo con cancelación:** Cadena RxJS (`debounceTime` → `distinctUntilChanged` → `switchMap`) que previene floods de API y race conditions entre requests concurrentes.

**Conceptos Técnicos Investigados**
*   **JPA Specifications:** Uso de `JpaSpecificationExecutor<T>` y `Specification<T>` para componer predicados dinámicos sin explosión combinatoria de métodos de repositorio. Cuatro factory methods stateless en `UserSpecification` (`hasNameContaining`, `hasLineageType`, `hasLocation`, `hasAgeBetween`).
*   **Spring Data Pagination:** Resolución automática de `Pageable` vía `PageableHandlerMethodArgumentResolver`, `@PageableDefault(size = 10, sort = "name")`, y transformación `Page.map()` para desacoplar entidades JPA del contrato de API.
*   **H2 en modo PostgreSQL:** Configuración `MODE=PostgreSQL` para maximizar compatibilidad SQL entre el sandbox y producción, con verificación de `LOWER()` + `LIKE` y generación DDL de `@Index`.
*   **Pipeline RxJS / Angular:** `FormGroup.valueChanges` con `debounceTime(300)`, `distinctUntilChanged` (comparador estructural vía `JSON.stringify`), y `switchMap` para cancelación automática de requests HTTP obsoletos. `takeUntilDestroyed` para limpieza de suscripciones.
*   **Ionic Infinite Scroll:** `<ion-infinite-scroll>` con append incremental de resultados, desactivación automática en última página, y `<ion-skeleton-text>` para feedback visual durante cargas.
*   **Modern Control Flow:** Sintaxis `@for` con `track user.id` para identidad estable en el change detection de Angular al appendear items por scroll infinito.

## Arquitectura y Decisiones
A diferencia del Spike 2 (puramente frontend), este entorno retoma la arquitectura **E2E completa** del Spike 1, extendiéndola con complejidad en ambas capas.
*   **Modelo de dominio evolucionado:** La entidad `User` reemplaza `membershipType` (String genérico) por campos que modelan las dimensiones reales de filtrado del dominio: `lineageType` (enum `DESCENDANT`/`PHILHELLENE` con `@Enumerated(STRING)`), `location` (String desnormalizado), y `birthDate` (`LocalDate` para predicados de rango).
*   **Seed Data estructurado:** `DevDataSeederConfig` inserta 24 registros con distribución controlada (~60% descendientes, 4 localidades, rango de edades desde menores hasta mayores de 60) para validar empíricamente filtros, paginación multi-página y condiciones de borde.
*   **Separación de DTOs:** `UserSummaryResponse` (lectura/búsqueda) y `UserRegistrationResponse` (escritura) como records independientes, siguiendo el principio de no exponer entidades `@Entity` gestionadas en respuestas de consulta.
*   **Manejo de errores centralizado:** `GlobalExceptionHandler` con tratamiento específico para validación de campos, conversión de enum inválido (`lineageType`), y errores genéricos.

## Conclusiones y Cuarentena
Este laboratorio valida la viabilidad del patrón `Specification<T>` para el motor de consultas del dashboard administrativo del MVP. Se documentan en `ACTIVIDAD_16_HALLAZGOS.md` los hallazgos de cuarentena: estructura JSON real de `Page<T>`, comportamiento de `LOWER()`+`LIKE` en H2, generación DDL de índices, legibilidad de Specifications a escala, cancelación efectiva de `switchMap`, edge cases de `ion-infinite-scroll`, y binding automático de enums por Spring.