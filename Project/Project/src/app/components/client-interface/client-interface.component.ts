  import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-client-interface',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-interface.component.html',
  styleUrls: ['./client-interface.component.css'],
})


export class ClientInterfaceComponent implements OnInit {
  doctors: any[] = []; 
  selectedDoctor: any = null; 
  weekDays: Date[] = [];
  selectedReservation: any = null; 
  patientInfo: { firstName: string; lastName: string } | null = null;
  weekHeader: string = ''; 
  timeSlots: string[] = [];
  reservations: any[] = [];
  currentDate: Date;
  doctorAvailabilities: { [key: string]: boolean } = {};
  newReservation: any = null; 
  cart = [];          // koszyk
  paymentStatus: string | null = null; // status płatności


  services = [
    { name: 'Pierwsza wizyta', price: 150 },
    { name: 'Wizyta kontrola', price: 120 },
    { name: 'Choroba przewlekła', price: 200 },
    { name: 'Recepta', price: 50 }
  ];


  total: number = 0;

  // Konstruktor komponentu
  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentDate = new Date();
  }

  // Inicjalizacja komponentu
  ngOnInit(): void {
    this.loadDoctors();
    this.loadInfo();
    this.generateWeekDays();
    this.generateTimeSlots();
    this.loadReservations(); 
    this.loadUserReservations();
  } 

  loadUserReservations() {
    // Tutaj możesz dodać kod do załadowania rezerwacji z API
    // Przykład statycznych danych
    this.reservations = [
      { type: 'Pierwsza wizyta', price: 150, selected: false },
      { type: 'Recepta', price: 50, selected: false },
      { type: 'Wizyta kontrolna', price: 120, selected: false },
      { type: 'Choroba przewlekła', price: 200, selected: false }
    ];
  }

  // Pobieranie ceny dla konkretnej rezerwacji
  getReservationPrice(type: string): number {
    return this.reservationPrices[type] ?? 0;
  }

  // Sumowanie zaznaczonych rezerwacji
  calculateTotal() {
    this.total = this.reservations
      .filter(reservation => reservation.selected)
      .reduce((sum, reservation) => sum + reservation.price, 0);
  }

  

  updateTotal() {
    this.total = this.reservations
      .filter(reservation => reservation.selected)
      .reduce((sum, reservation) => sum + reservation.price, 0);
  }

  simulatePayment() {
    alert('Zapłacono.');
  }

  // Sprawdzenie, czy dany slot jest aktualny
  isCurrentSlot(day: Date, time: string): boolean {
    const now = new Date();
    const [hour, minute] = time.split(':').map(Number);
    const slotDateTime = new Date(day);
    slotDateTime.setHours(hour, minute, 0, 0);
    return (
      now.getDate() === slotDateTime.getDate() &&
      now.getMonth() === slotDateTime.getMonth() &&
      now.getFullYear() === slotDateTime.getFullYear() &&
      now.getHours() === slotDateTime.getHours() &&
      Math.abs(now.getMinutes() - slotDateTime.getMinutes()) < 30
    );
  }

  // Generowanie dni tygodnia
  generateWeekDays(): void {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
  
    // Aktualizacja nagłówka tygodnia
    const start = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + 6);
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    this.weekHeader = `${start} - ${endStr}`;
  }

  // Funkcja do ładowania listy lekarzy
  async loadDoctors(): Promise<void> {
    try {
      this.doctors = await this.firebaseService.getAllDoctors();
    } catch (error) {
      console.error('Błąd podczas ładowania listy lekarzy:', error);
    }
  }
  
  // Generowanie slotów czasowych
  generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 8; hour < 21; hour++) {
      this.timeSlots.push(`${hour}:00`);
      this.timeSlots.push(`${hour}:30`);
    }
  }


  // Funkcja do uzyskania początku tygodnia
  getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  // reservationPrices: Record<'Pierwsza wizyta' | 'Wizyta kontrola' | 'Choroba przewlekła' | 'Recepta', number> = {
  //   'Pierwsza wizyta': 150,
  //   'Wizyta kontrola': 120,
  //   'Choroba przewlekła': 200,
  //   'Recepta': 50
  // };
  
  // getReservationPrice(type: 'Pierwsza wizyta' | 'Wizyta kontrola' | 'Choroba przewlekła' | 'Recepta'): number {
  //   return this.reservationPrices[type];
  // }


  reservationPrices: Record<string, number> = {
    'Pierwsza wizyta': 150,
    'Wizyta kontrolna': 120,
    'Choroba przewlekła': 200,
    'Recepta': 50
  };
  
  
  goToPayment() {
    alert(`Przejście do płatności za: ${this.getReservationPrice(this.selectedReservation.type)} zł`);
  }
  
 

  // Funkcja sprawdzająca, czy dany dzień jest dzisiaj
  isToday(date: Date): boolean {
    const today = new Date();
    return today.toDateString() === date.toDateString();
  }

  // Funkcja do ładowania informacji o pacjencie
  async loadInfo(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (user) {
      const patientData = await this.firebaseService.getUserData(user.uid);
      this.patientInfo = {
        firstName: patientData.firstName || '',
        lastName: patientData.lastName || '',
      };
    }
  }
  
  // Funkcja sprawdzająca, czy dany slot jest przeszły
  isPastSlot(day: Date, time: string): boolean {
    const now = new Date();
    const [hour, minute] = time.split(':').map(Number);
    const slotTime = new Date(day);
    slotTime.setHours(hour, minute, 0, 0);
    return slotTime < now;
  }

  // Funkcja powrotu do menu
  backToMenu(): void {
    this.selectedDoctor = null;
    this.doctorAvailabilities = {};
    this.newReservation = null;
    this.selectedReservation = null;
  }

// Sprawdzenie, czy slot jest dostępny
isSlotAvailable(day: Date, time: string): boolean {
  const slotKey = `${this.formatDate(day)}_${time}`;
  return !!this.doctorAvailabilities[slotKey];
}


  isSlotReserved(day: Date, time: string): boolean {
    return this.reservations.some(
      (reservation) =>
        reservation.date === this.formatDate(day) && reservation.time === time
    );
  }

// Wybór slotu do rezerwacji
selectSlot(day: Date, time: string): void {
  const user = this.authService.getCurrentUser();
  if (!user) {
    alert('User not logged in.');
    return;
  }

  const formattedDate = this.formatDate(day); // Użyj lokalnie sformatowanej daty

  if (!this.isSlotAvailable(day, time)) return; // Sprawdź dostępność

  // Przygotowanie formularza rezerwacji
  this.newReservation = {
    date: formattedDate, // Zawsze lokalna data
    time,
    doctorId: this.selectedDoctor.id,
    doctorName: `${this.selectedDoctor.firstName} ${this.selectedDoctor.lastName}`,
    patientId: user.uid,
    patientName: this.patientInfo ? `${this.patientInfo.firstName} ${this.patientInfo.lastName}` : '',
    gender: '',
    age: null,
    type: '',
    notes: '',
  };

  console.log('Nowa rezerwacja:', this.newReservation);
}



// Zapis rezerwacji
async saveReservation(): Promise<void> {
  if (!this.newReservation) return;

  try {
    // Wywołanie metody serwisu Firebase z pełnym obiektem rezerwacji
    await this.firebaseService.addReservation(this.newReservation);
    alert('Rezerwacja została zapisana!');

    this.newReservation = null; // Resetuj formularz

    // Odśwież widok dostępności lekarza
    await this.selectDoctor(this.selectedDoctor);

    // Odśwież listę rezerwacji pacjenta natychmiast po dodaniu
    await this.loadReservations();
  } catch (error) {
    console.error('Błąd podczas zapisywania rezerwacji:', error);
  }
}

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Dodajemy 1, bo miesiące są indeksowane od 0
    const day = date.getDate().toString().padStart(2, '0'); // Dzień jest poprawny
  
    return `${year}-${month}-${day}`;
  }


  // Wylogowanie użytkownika
  onLogout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }

  // Ładowanie rezerwacji pacjenta
  async loadReservations(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (user) {
      try {
        this.reservations = await this.firebaseService.getReservationsByPatient(user.uid);
  
        // Debugowanie: sprawdź poprawność daty
        this.reservations.forEach((reservation) => {
          console.log('Rezerwacja:', reservation.date);
        });
      } catch (error) {
        console.error('Error loading patient reservations:', error);
      }
    }
  }



  // Wyświetlanie szczegółów rezerwacji
  showReservation(day: Date, time: string): void {
    const formattedDate = this.formatDate(day);
  
    // Wyszukiwanie rezerwacji za pomocą metody `find`
    this.selectedReservation = this.reservations.find(
      ({ date, time: reservationTime }) => date === formattedDate && reservationTime === time
    ) || null; // Ustawienie na `null`, jeśli rezerwacja nie została znaleziona
  }
  
  
  // Anulowanie rezerwacji
  async cancelReservation(): Promise<void> {
    if (!this.selectedReservation) return;
  
    try {
      const { id, doctorId, date, time } = this.selectedReservation;
  
      // Usuń rezerwację z Firestore
      await this.removeReservationFromDatabase(id);
  
      // Aktualizuj listę rezerwacji
      this.updateReservationsList(id);
  
      // Oznacz slot jako dostępny
      await this.markSlotAsAvailable(doctorId, `${date}_${time}`);
  
      this.notifySuccess('Rezerwacja usunięta pomyślnie!');
      this.clearSelectedReservation();
    } catch (error) {
      this.handleError('Błąd podczas usuwania rezerwacji:', error);
    }
  }
  // Usuwanie rezerwacji z bazy danych
  private async removeReservationFromDatabase(reservationId: string): Promise<void> {
    await this.firebaseService.deleteReservation(reservationId);
  }
  // Aktualizacja listy rezerwacji
  private updateReservationsList(reservationId: string): void {
    this.reservations = this.reservations.filter((r) => r.id !== reservationId);
  }
  // Oznaczanie slotu jako dostępnego
  private async markSlotAsAvailable(doctorId: string, slot: string): Promise<void> {
    await this.firebaseService.markSlotAsAvailable(doctorId, slot);
  }
  // Powiadomienie o sukcesie
  private notifySuccess(message: string): void {
    alert(message);
  }
  // Czyszczenie wybranej rezerwacji
  private clearSelectedReservation(): void {
    this.selectedReservation = null;
  }
  // Obsługa błędów
  private handleError(logMessage: string, error: any): void {
    console.error(logMessage, error);
  }

// Przejście do poprzedniego tygodnia
prevWeek(): void {
  this.currentDate.setDate(this.currentDate.getDate() - 7);
  this.generateWeekDays();
}

// Przejście do następnego tygodnia
nextWeek(): void {
  this.currentDate.setDate(this.currentDate.getDate() + 7);
  this.generateWeekDays();
}

// Wybór lekarza
async selectDoctor(doctor: any): Promise<void> {
  this.selectedDoctor = doctor; // Zapisz wybranego lekarza
  this.doctorAvailabilities = {}; // Wyczyść dostępności

  try {
    const availabilities = await this.firebaseService.getDoctorAvailabilities(doctor.id); // Pobierz dostępności lekarza

    // Tworzenie obiektu dostępności w jednym kroku
    this.doctorAvailabilities = Object.fromEntries(
      availabilities.map((slot: string) => [slot, true])
    );

    console.log('Dostępności lekarza:', this.doctorAvailabilities); // Debugowanie
  } catch (error) {
    console.error('Błąd podczas ładowania dostępności lekarza:', error); // Obsługa błędów
  }
}

// Wybór rezerwacji
viewReservationDetails(reservation: any) {
  this.selectedReservation = reservation;
}
  
  





}
