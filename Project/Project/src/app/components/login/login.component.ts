import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; //importowanie serwisu uwierzytelniania
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true, //komponent jest samodzielnym komponentem
  imports: [CommonModule, FormsModule,RouterModule],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = ''; // Zmienna do przechowywania błędów logowania
  // Zmienne do zarządzania widocznością hasła
  showPassword = false;
  showConfirmPassword = false;

  constructor(private authService: AuthService, private router: Router) {}


  // Funkcja do zmiany widoczności hasła
  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      const passwordField = document.getElementById('password') as HTMLInputElement;
      passwordField.type = this.showPassword ? 'text' : 'password';
    }
  }

  // Funkcja nawigacji do widoku niezalogowanego użytkownika
  navigateToUnauthorizedView() {
    this.router.navigate(['/unauthorized']);  // Zmiana ścieżki na odpowiednią stronę
  }
  
  //Asynchroniczna funkcja logowania
  async onLogin() {
    

    try {
      await this.authService.login(this.email, this.password); //Próba logowania
      const user = this.authService.getCurrentUser(); //pobranie zalogowanego użytkownika
      const role = await this.authService.getUserRole(user?.uid || ''); //pobranie roli użytkownika
      localStorage.setItem('userRole', role); //zapisać rolę użytkownika w pamięci lokalnej
      if (role === 'patient') {
        this.router.navigate(['/patient']);
      } else if (role === 'doctor') {
        this.router.navigate(['/doctor']);
      }
    } catch (error: any) { //obsługa błędów logowania
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'Nie znaleziono użytkownika z tym adresem e-mail.';
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Nieprawidłowe hasło.';
      } else {
        this.errorMessage = 'Logowanie nieudane: ' + error.message;
      }
    }
  }
}
