# Actividad 16 - Validacion E2E y Documentacion de Hallazgos

## Alcance ejecutado

Se validaron empiricamente el contrato HTTP del backend, el flujo `POST -> GET` para un usuario nuevo y los edge cases de paginacion asociados a la UI de busqueda. Ademas, se reforzo el componente `UserFilterListComponent` para evitar requests superpuestos cuando `ion-infinite-scroll` dispara eventos rapidos sucesivos.

## Evidencia empirica recopilada

### 1. Baseline de `Page<T>`

Request ejecutado:

```text
GET http://localhost:8080/api/users
```

Resultado observado en esta sesion:

- `totalElements = 24`
- `totalPages = 3`
- `number = 0`
- `size = 10`
- `first = true`
- `last = false`
- `content.length = 10`

Observacion importante:

- Spring Boot serializa mas campos de los esperados inicialmente: `pageable`, `sort` y `numberOfElements`.
- El runtime emite un warning indicando que serializar `PageImpl` "as-is" no garantiza estabilidad futura del JSON.

Conclusion:

- La estructura actual consumida por Angular funciona hoy, pero debe considerarse un contrato de cuarentena, no un contrato estable a largo plazo.

### 2. Filtro `LOWER()` + `LIKE`

Request ejecutado:

```text
GET http://localhost:8080/api/users?name=papa
```

Resultado observado:

- `ANDRES PAPAS`
- `NICOLAS PAPADOPOULOS`
- `VALERIA PAPATHANASIOU`

Conclusion:

- El predicado `LOWER(name) LIKE '%papa%'` funciona correctamente en H2 con `MODE=PostgreSQL`.

### 3. Generacion DDL de `@Index`

En el arranque del backend quedaron visibles en log las sentencias:

```text
Hibernate: create index idx_lineage_type on users (lineage_type)
Hibernate: create index idx_location on users (location)
Hibernate: create index idx_birth_date on users (birth_date)
```

Conclusion:

- La generacion DDL de los tres indices quedo verificada.

### 4. Legibilidad de `Specification`

Estado observado tras implementar 4 filtros:

- El patron sigue siendo legible para filtros planos unidos por `AND`.
- La intencion de cada factory method se mantiene clara.
- El costo cognitivo sigue siendo bajo mientras no haya joins, grupos `OR`, ni reglas condicionales anidadas.

Recomendacion de cuarentena:

- Con 4 filtros el enfoque actual es adecuado.
- A partir de 6 a 8 filtros complejos, o si aparecen joins y composiciones mixtas `AND/OR`, QueryDSL pasaria a ser una opcion mas mantenible.

### 5. Registro real y busqueda del usuario creado

Request ejecutado:

```text
POST http://localhost:8080/api/users
Content-Type: application/json

{
  "name": "DIMITRIOS PAPADOPOULOS",
  "email": "dimitrios.<timestamp>@example.com",
  "lineageType": "DESCENDANT",
  "location": "Resistencia",
  "birthDate": "1990-05-15"
}
```

Resultado observado:

- El backend creo el usuario con `id = 25`.
- La busqueda posterior `GET /api/users?name=dimitrios` devolvio `totalElements = 1`.
- El contenido incluyo a `DIMITRIOS PAPADOPOULOS`.

Conclusion:

- El flujo de integracion `register -> search` quedo confirmado a nivel API.

### 6. Filtros combinados, paginacion y sort

Validaciones ejecutadas:

- `GET /api/users?location=Resistencia&lineageType=DESCENDANT&minAge=18&page=0&size=10&sort=name,asc`
- `GET /api/users?page=0&size=10&sort=name,asc`
- `GET /api/users?page=1&size=10&sort=name,asc`
- `GET /api/users?page=2&size=10&sort=name,asc`
- `GET /api/users?sort=birthDate,desc&size=5`

Hallazgos:

- Los filtros combinados devolvieron 3 resultados y todos cumplieron `location=Resistencia` y `lineageType=DESCENDANT`.
- La paginacion avanzo `0 -> 1 -> 2` sin superposicion de nombres entre paginas.
- La pagina 2 devolvio `contentCount = 4` y `last = true`.
- El sort por `birthDate,desc` devolvio primero a los usuarios mas jovenes.

### 7. Enum binding automatico

Request ejecutado:

```text
GET http://localhost:8080/api/users?lineageType=INVALID
```

Resultado observado:

```json
{
  "status": 400,
  "message": "Error de validacion.",
  "fieldErrors": {
    "lineageType": "El valor de lineageType es invalido. Valores permitidos: DESCENDANT, PHILHELLENE."
  }
}
```

Conclusion:

- Spring si convierte automaticamente `DESCENDANT` al enum sin converter custom.
- Los valores invalidos ya quedan encapsulados por `GlobalExceptionHandler` con `400` y mensaje de dominio controlado.

## Edge cases de `ion-infinite-scroll`

### Estado vacio

Request ejecutado:

```text
GET http://localhost:8080/api/users?name=zzzznonexistent&page=0&size=10
```

Resultado observado:

- `totalElements = 0`
- `content.length = 0`
- `first = true`
- `last = true`
- `empty = true`

Impacto en frontend:

- El template ya muestra el empty state.
- El infinite scroll queda deshabilitado porque la condicion incluye `users.length === 0`.

### Scroll rapido sucesivo

Hallazgo:

- El componente permitia que `ionInfinite` disparara mas de una carga antes de completar la anterior.
- Eso podia producir requests concurrentes de paginas siguientes si el usuario hacia scroll agresivo.

Correccion aplicada en esta actividad:

- Se agrego el flag `isLoadingNextPage`.
- El handler `onInfiniteScroll()` ahora rechaza reentradas mientras una pagina adicional esta en vuelo.
- El template deshabilita `ion-infinite-scroll` durante esa carga intermedia.

## Obligacion pendiente de verificacion manual en navegador

### Cancelacion visible de `switchMap`

Estado:

- El wiring de Angular esta correctamente implementado con `debounceTime(300)` + `distinctUntilChanged(...)` + `switchMap(...)`.
- En este entorno no fue posible automatizar DevTools/Network para observar el estado visual `(canceled)` del browser request.

Checklist manual sugerido:

1. Abrir `http://localhost:4200/search`.
2. Abrir DevTools > Network.
3. Escribir rapido en el searchbar: `p`, `pa`, `pap`, `papa`.
4. Confirmar que los requests previos aparecen como cancelados o abortados y que solo el ultimo actualiza la lista.

## Cierre de cuarentena para esta actividad

Estado final:

- Backend: validado empiricamente.
- Contrato de filtros y paginacion: validado empiricamente.
- Flujo `register -> search`: validado empiricamente.
- `ion-infinite-scroll` ante scroll rapido: endurecido con fix concreto.
- Cancelacion visible en DevTools: documentada como verificacion manual final.
