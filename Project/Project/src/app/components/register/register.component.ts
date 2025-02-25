import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = 'patient';
  firstName: string = '';
  lastName: string = '';
  specialization: string = ''; 
  passwordFieldType: string = 'password';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      const passwordField = document.getElementById('password') as HTMLInputElement;
      passwordField.type = this.showPassword ? 'text' : 'password';
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
      const confirmPasswordField = document.getElementById('confirmPassword') as HTMLInputElement;
      confirmPasswordField.type = this.showConfirmPassword ? 'text' : 'password';
    }
  }
  
  // Zmienne do zarządzania widocznością hasła
  showPassword = false;
  showConfirmPassword = false;

  // Funkcja do zmiany widoczności hasła
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Asynchroniczna funkcja rejestracji
  async onRegister() {
    // Sprawdzenie, czy użytkownik wpisał imię
    if (!this.firstName) {
      this.errorMessage = 'Wpisz swoje imię.';
      return;
    }

    // Sprawdzenie, czy użytkownik wpisał nazwisko
    if (!this.lastName) {
      this.errorMessage = 'Wpisz swoje nazwisko.';
      return;
    }
    if (!this.email) {
      this.errorMessage = 'Wpisz adres e-mail.';
      return;
    }

    // Sprawdzenie, czy użytkownik wpisał hasło
    if (this.password.length < 6) {
      this.errorMessage = 'Hasło powinno mieć co najmniej 6 znaków.';
      return;
    }
    
    // Sprawdzenie, czy hasło i potwierdzenie hasła są takie same
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Wpisałeś różne hasła!.';
      return;
    }

    // Sprawdzenie, czy użytkownik wybrał rolę
    if (this.role === 'doctor' && !this.specialization) {
      this.errorMessage = 'Wpisz swoją specjalizacje.';
      return;
    }


    try {
      await this.authService.register(
        this.email,
        this.password,
        this.role,
        this.firstName,
        this.lastName,
        this.role === 'doctor' ? this.specialization : undefined
      );
      console.log('Rejestracja zakończona pomyślnie'); //komunikat o pomyślnej rejestracji
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Rejestracja nieudana.';
      console.error('Błąd rejestracji:', error);
    }
  }

  // Funkcja nawigacji do widoku niezalogowanego użytkownika
  navigateToUnauthorizedView() {
    this.router.navigate(['/unauthorized']);  // Zmiana ścieżki na odpowiednią stronę
  }
}
