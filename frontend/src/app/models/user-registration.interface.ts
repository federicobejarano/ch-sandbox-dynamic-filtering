export interface UserRegistrationRequest {
  /* Nombre de Usuario: texto libre
  * Backend: @NotBlank @Size(min=2, max=100)
  * Frontend: Validators.required, Validators.minLength(2)
  */
  name: string;

  /* Correo
  * Backend: @NotBlank @Email
  * Frontend: Validators.required, Validators.email
  */
  email: string;

  /* Tipo de linaje dentro del dominio del spike
  * Backend: @NotBlank
  * Frontend: Validators.required (ion-select restringe las opciones)
  *   Valores posibles: 'DESCENDANT' | 'PHILHELLENE'
  */
  lineageType: string;

  /* Ubicación textual desnormalizada
  * Backend: @NotBlank
  * Frontend: Validators.required
  */
  location: string;

  /* Fecha de nacimiento
  * Backend: @NotNull @Past
  * Frontend: Validators.required
  */
  birthDate: string;
}