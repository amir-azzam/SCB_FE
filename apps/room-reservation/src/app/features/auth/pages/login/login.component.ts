import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

import { AuthService } from '@/services/auth.service';
import { LoginRequest } from '@/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
    DividerModule,
  ],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4"
    >
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div
            class="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mb-6 transform hover:scale-105 transition-transform"
          >
            <i class="pi pi-home text-white text-3xl"></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">BookedIn</h1>
          <p class="text-gray-600">Meeting Room Management System</p>
        </div>

        <p-card styleClass="shadow-xl border-0">
          <ng-template pTemplate="header">
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
              <h2 class="text-lg font-semibold text-gray-800 flex items-center">
                <i class="pi pi-sign-in mr-2 text-blue-600"></i>
                Sign In to Your Account
              </h2>
            </div>
          </ng-template>

          <ng-template pTemplate="content">
            <form
              [formGroup]="loginForm"
              (ngSubmit)="onSubmit()"
              class="space-y-6 pt-4"
            >
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  <i class="pi pi-envelope mr-1 text-gray-500"></i>
                  Email Address
                </label>
                <input
                  pInputText
                  formControlName="email"
                  placeholder="Enter your email address"
                  class="w-full"
                  size="large"
                  [class.ng-invalid]="
                    loginForm.get('email')?.invalid &&
                    loginForm.get('email')?.touched
                  "
                />
                <small
                  *ngIf="
                    loginForm.get('email')?.invalid &&
                    loginForm.get('email')?.touched
                  "
                  class="text-red-600 flex items-center"
                >
                  <i class="pi pi-exclamation-triangle mr-1"></i>
                  Please enter a valid email address
                </small>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  <i class="pi pi-lock mr-1 text-gray-500"></i>
                  Password
                </label>
                <p-password
                  formControlName="password"
                  placeholder="Enter your password"
                  styleClass="w-full"
                  inputStyleClass="w-full"
                  [toggleMask]="true"
                  [feedback]="false"
                  size="large"
                  [class.ng-invalid]="
                    loginForm.get('password')?.invalid &&
                    loginForm.get('password')?.touched
                  "
                />
                <small
                  *ngIf="
                    loginForm.get('password')?.invalid &&
                    loginForm.get('password')?.touched
                  "
                  class="text-red-600 flex items-center"
                >
                  <i class="pi pi-exclamation-triangle mr-1"></i>
                  Password is required
                </small>
              </div>

              <p-message
                *ngIf="errorMessage"
                severity="error"
                styleClass="w-full"
              >
                <ng-template pTemplate>
                  <div class="flex items-center">
                    <i class="pi pi-times-circle mr-2"></i>
                    <span>{{ errorMessage }}</span>
                  </div>
                </ng-template>
              </p-message>

              <div class="pt-2">
                <p-button
                  type="submit"
                  label="Sign In"
                  icon="pi pi-sign-in"
                  styleClass="w-full"
                  size="large"
                  [disabled]="loginForm.invalid || isLoading"
                  [loading]="isLoading"
                  loadingIcon="pi pi-spinner pi-spin"
                >
                </p-button>
              </div>
            </form>
          </ng-template>
        </p-card>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep {
        .p-card {
          border-radius: 16px;
          overflow: hidden;
        }

        .p-card .p-card-header {
          padding: 0;
          border-radius: 16px 16px 0 0;
        }

        .p-inputtext:focus,
        .p-password input:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          border-color: rgb(59, 130, 246);
        }

        .p-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .p-button:hover {
          background: linear-gradient(
            135deg,
            #2563eb 0%,
            #1d4ed8 100%
          ) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        .p-button:active {
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class LoginComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.loginForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = this.loginForm.value;

    this.authService
      .login(credentials)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {
          // Success - navigation handled in auth service
        },
        error: (error) => {
          this.errorMessage =
            error.message || 'Login failed. Please try again.';
        },
      });
  }
}
