import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonRouterLink,
  IonSelect,
  IonSelectOption,
  ToastController,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { UserRegistrationRequest } from '../../models/user-registration.interface';
import { UserRegistrationResponse } from '../../models/user-registration-response.interface';
import { ValidationErrorResponse } from '../../models/validation-error-response.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonRouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
  ],
})
export class RegistrationForm {
  private readonly userService = inject(UserService);
  private readonly toastController = inject(ToastController);

  readonly lineageOptions = [
    { value: 'DESCENDANT', label: 'Descendiente' },
    { value: 'PHILHELLENE', label: 'Filoheleno' },
  ];

  readonly registrationForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    lineageType: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    location: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    birthDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  get nameCtrl(): FormControl<string> {
    return this.registrationForm.controls.name;
  }

  get emailCtrl(): FormControl<string> {
    return this.registrationForm.controls.email;
  }

  get lineageTypeCtrl(): FormControl<string> {
    return this.registrationForm.controls.lineageType;
  }

  get locationCtrl(): FormControl<string> {
    return this.registrationForm.controls.location;
  }

  get birthDateCtrl(): FormControl<string> {
    return this.registrationForm.controls.birthDate;
  }

  get todayDate(): string {
    return new Date().toISOString().split('T')[0] ?? '';
  }

  getErrorText(
    control: FormControl<string>,
    errorMap: Record<string, string>,
  ): string {
    if (!control.touched || control.valid) {
      return '';
    }

    for (const [errorKey, message] of Object.entries(errorMap)) {
      if (control.hasError(errorKey)) {
        if (errorKey === 'serverError') {
          return (control.getError('serverError') as string | undefined) ?? message;
        }

        return message;
      }
    }

    return '';
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    const payload: UserRegistrationRequest = {
      ...this.registrationForm.getRawValue(),
      location: this.registrationForm.controls.location.value.trim(),
    };

    this.userService.register(payload).subscribe({
      next: (response: UserRegistrationResponse) => {
        void this.presentToast(
          `Usuario registrado correctamente: ${response.name}`,
          'success',
        );
        this.registrationForm.reset({
          name: '',
          email: '',
          lineageType: '',
          location: '',
          birthDate: '',
        });
      },
      error: (error: HttpErrorResponse) => {
        const validationError = error.error as ValidationErrorResponse | null;
        const fieldErrors = validationError?.fieldErrors ?? {};
        const message = validationError?.message ?? 'Error inesperado del servidor';

        this.applyServerErrors(fieldErrors);
        void this.presentToast(message, 'danger');
      },
    });
  }

  private applyServerErrors(fieldErrors: Record<string, string>): void {
    Object.entries(fieldErrors).forEach(([fieldName, message]) => {
      const control = this.registrationForm.get(fieldName);

      if (!control) {
        return;
      }

      control.setErrors({
        ...(control.errors ?? {}),
        serverError: message,
      });
      control.markAsTouched();
    });
  }

  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning',
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
    });

    await toast.present();
  }
}
