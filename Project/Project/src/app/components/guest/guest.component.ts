import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase/firebase.service';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-guest',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './guest.component.html',
  styleUrls: ['./guest.component.css']
})
export class GuestComponent implements OnInit {
  doctors: any[] = []; // Lista lekarzy

  constructor(private router: Router, private firebaseService: FirebaseService) {}

  // Inicjalizacja komponentu, ładowanie listy lekarzy
  ngOnInit(): void {
    this.loadDoctors();
  }

  // Ładowanie listy lekarzy
  async loadDoctors(): Promise<void> {
    try {
      this.doctors = await this.firebaseService.getAllDoctors(); // Pobierz listę lekarzy z serwisu Firebase
    } catch (error) {
      console.error('Błąd podczas ładowania listy lekarzy:', error);
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
