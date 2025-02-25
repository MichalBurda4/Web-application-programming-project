import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../firebase/firebase.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-doctor-interface',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-interface.component.html',
  styleUrls: ['./doctor-interface.component.css'],
})
export class WeeklyCalendarComponent implements OnInit {
  currentDate: Date; // Aktualna data
  weekDays: Date[] = [];// Dni tygodnia
  timeSlots: string[] = []; // Sloty czasowe
  selectedSlots: { [key: string]: boolean } = {}; // Typ indeksowany
  doctorId: string | null = null; // Identyfikator lekarza
  doctorInfo: { firstName: string; lastName: string; specialization: string } | null = null; // Informacje o lekarzu
  weekHeader: string = ''; 
  reservations: any[] = []; 
  selectedReservation: any = null; 
  //hours: string[] = [];

  // Dane formularza dostępności
  availabilityForm = {
    startDate: '', // Data początkowa
    endDate: '', // Data końcowa
    selectedDays: { 
      Monday: false, 
      Tuesday: false, 
      Wednesday: false, 
      Thursday: false, 
      Friday: false, 
      Saturday: false, 
      Sunday: false 
    } as { [key: string]: boolean }, // Typ indeksowany
    startTime: '', // Godzina początkowa
    endTime: '' // Godzina końcowa
  };


  //daysOfWeek = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Konstruktor z wstrzykiwanymi zależnościami
  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentDate = new Date();
  }

  ngOnInit(): void {
    this.doctorId = this.authService.getCurrentUser()?.uid || null;
  
    if (this.doctorId) {
      this.loadDoctorInfo(this.doctorId); // Ładujemy informacje o lekarzu
      this.loadReservations(); // Ładujemy rezerwacje
    }
    this.generateWeekDays(); // Generujemy dni tygodnia
    this.generateTimeSlots(); // Generujemy sloty czasowe
    this.loadAvailabilitiesFromFirebase(); // Ładujemy dostępności z Firebase
    this.removePastSlots(); // Usuwamy przeszłe sloty
  }

  // Funkcja do ładowania informacji o lekarzu
  async loadDoctorInfo(doctorId: string): Promise<void> {
    try {
      const doctorData = await this.firebaseService.getUserData(doctorId); // Pobieramy dane lekarza
      if (doctorData) {
        this.doctorInfo = {
          firstName: doctorData.firstName || '', // Jeśli nie ma imienia, ustawiamy pusty ciąg znaków
          lastName: doctorData.lastName || '', // Jeśli nie ma nazwiska, ustawiamy pusty ciąg znaków
          specialization: doctorData.specialization || '', // Jeśli nie ma specjalizacji, ustawiamy pusty ciąg znaków
        };
      }
    } catch (error) {
      console.error('Error loading doctor info:', error);
    }
  }

  // Funkcja do usuwania przeszłych slotów
  async removePastSlots(): Promise<void> {
    if (!this.doctorId) return;
  
    try {
      // Pobieramy dostępności lekarza
      const availabilities = await this.firebaseService.getDoctorAvailabilities(this.doctorId);
      
      // Tworzymy obiekt daty i godziny "teraz"
      const now = new Date();
  
      // Przechowujemy przyszłe dostępności w tablicy
      const futureSlots = [];
  
      for (const slotKey of availabilities) {
        const [date, time] = slotKey.split('_');
        const [hour, minute] = time.split(':').map(Number);
  
        // Tworzymy obiekt daty dla slotu
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, minute, 0, 0);
  
        // Jeśli slot jest przyszły, dodajemy go do listy
        if (slotDateTime >= now) {
          futureSlots.push(slotKey);
        }
      }
  
      // Zapisujemy przyszłe dostępności
      await this.firebaseService.saveDoctorAvailabilities(this.doctorId, futureSlots);
      console.log('Usunięto przeszłe dostępności');
    } catch (error) {
      console.error('Błąd podczas usuwania przeszłych slotów:', error);
    }
  }

  // Funkcja do generowania dni tygodnia
  generateWeekDays(): void {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    const endOfWeek = this.getEndOfWeek(startOfWeek); 
    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
    const start = this.formatDateWithMonth(startOfWeek);
    const end = this.formatDateWithMonth(endOfWeek);
    this.weekHeader = `Week of ${start} - ${end}`;
  }

  // Funkcja do generowania slotów czas
  generateTimeSlots(): void {
    this.timeSlots = [];
    for (let hour = 8; hour < 21; hour++) {
      // Tworzymy godziny co 30 minut
      this.timeSlots.push(`${hour}:00`);
      this.timeSlots.push(`${hour}:30`);
    }
  }
  
  // Funkcja do pobierania początku tygodnia
  getStartOfWeek(date: Date): Date {
    const start = new Date(date);
    const day = (start.getDay() + 6) % 7; // Start from Monday
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  // Funkcja do sprawdzania, czy slot
  isPastSlot(day: Date, time: string): boolean {
    const now = new Date();
    const [hour, minute] = time.split(':').map(Number);
    const slotTime = new Date(day);
    slotTime.setHours(hour, minute, 0, 0);

    return slotTime < now;
  }


  // Funkcja do sprawdzania, czy slot jest zaznaczony
  isSlotSelected(day: Date, time: string): boolean {
    const slotKey = `${this.formatDate(day)}_${time}`;
    return !!this.selectedSlots[slotKey];
  }
  // Funkcja do zaznaczania slotów
  toggleSlot(day: Date, time: string): void {
    const slotKey = `${this.formatDate(day)}_${time}`;
    this.selectedSlots[slotKey] = !this.selectedSlots[slotKey];
  }
  // Funkcja do zaznaczania wszystkich slotów
  toggleAllDay(day: Date): void {
    const daySlots = this.timeSlots.map((time) => `${this.formatDate(day)}_${time}`);
    const allSelected = daySlots.every((slot) => this.selectedSlots[slot]);
    daySlots.forEach((slot) => (this.selectedSlots[slot] = !allSelected));  
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Dodajemy 1, bo miesiące są indeksowane od 0
    const day = date.getDate().toString().padStart(2, '0'); // Dzień jest poprawny
  
    // return ${year}-${month}-${day};
    return `${year}-${month}-${day}`;
  }
  
  // Funkcja do zapisywania dostępności
  async saveAvailabilities(): Promise<void> {
    if (!this.doctorId) {
      return;
    }
  
    try {
      // Tworzymy tablicę z wybranych slotów
      const selectedSlotsArray = Object.entries(this.selectedSlots)
        .filter(([slot, isSelected]) => isSelected)
        .map(([slot]) => slot);
  
      // Mapujemy sloty, aby je skorygować
      const correctedSlotsArray = selectedSlotsArray.map((slot) => {
        const [date, time] = slot.split('_');
        const correctedDate = this.formatDate(new Date(date)); // Korekta daty
        return `${correctedDate}_${time}`;
      });
  
      // Zapisujemy dyspozycyjność w Firebase
      await this.firebaseService.saveDoctorAvailabilities(this.doctorId, correctedSlotsArray);
  
      // Informujemy użytkownika o sukcesie
      alert('Dyspozycyjność zapisano!');
    } catch (error) {
      console.error('Błąd zapisywania dyspozycyjności:', error);
    }
  }
  
  
  // Funkcja do ładowania dostępności
  async loadAvailabilitiesFromFirebase(): Promise<void> {
    if (!this.doctorId) return;

    try {
      const availabilities = await this.firebaseService.getDoctorAvailabilities(this.doctorId);
      this.selectedSlots = availabilities.reduce((acc, slot) => {
        acc[slot] = true;
        return acc;
      }, {} as { [key: string]: boolean });
    } catch (error) {
      console.error('Błąd podczas ładowania danych:', error);
    }
  }
  // Funkcja do zapisywania rezerwacji
  onLogout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }


  // Funkcja do zapisywania rezerwacji
  // async loadReservations(): Promise<void> {
  //   if (!this.doctorId) return;
  
  //   try {
  //     const reservations = await this.firebaseService.getReservationsByDoctor(this.doctorId);
  //     this.selectedSlots = reservations.reduce((acc: { [key: string]: any }, reservation) => {
  //       const slotKey = `${reservation.date}_${reservation.time}`;
  //       acc[slotKey] = {
  //         reserved: true,
  //         patientName: reservation.patientName, 
  //       };
  //       return acc;
  //     }, {});
  //   } catch (error) {
  //     console.error('Błąd podczas ładowania rezerwacji:', error);
  //   }
  // }

  async loadReservations(): Promise<void> {
    if (!this.doctorId) return;
  
    try {
      const reservations = await this.firebaseService.getReservationsByDoctor(this.doctorId);
      this.reservations = reservations.map((reservation) => ({
        patientName: reservation.patientName || 'Unknown',
        date: reservation.date,
        time: reservation.time,
        gender: reservation.gender || 'N/A',
        age: reservation.age || 'N/A',
        type: reservation.type || 'N/A',
        note: reservation.notes || 'Brak notatki',
        
      }));
    } catch (error) {
      console.error('Error loading reservations:', error);
    }
  }
  
  // Funkcja do zapisywania rezerwacji
  isCurrentSlot(day: Date, time: string): boolean { // Sprawdź, czy dany slot jest aktualny
    const now = new Date();
    const [hour, minute] = time.split(':').map(Number);
    const slotTime = new Date(day);
    slotTime.setHours(hour, minute, 0, 0);
  
    return (
      now.getFullYear() === slotTime.getFullYear() &&
      now.getMonth() === slotTime.getMonth() &&
      now.getDate() === slotTime.getDate() &&
      now.getHours() === slotTime.getHours() &&
      Math.floor(now.getMinutes() / 30) === Math.floor(minute / 30)
    );
  }

  prevWeek(): void { // Przesuń tydzień wstecz
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateWeekDays();
  }

  nextWeek(): void { // Przesuń tydzień do przodu
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateWeekDays();
  }
 
  isToday(date: Date): boolean { // Sprawdź, czy dana data jest dzisiaj
    const today = new Date();
    return (
      today.getDate() === date.getDate() && // Sprawdzamy dzień
      today.getMonth() === date.getMonth() && // Sprawdzamy miesiąc
      today.getFullYear() === date.getFullYear() // Sprawdzamy rok
    );
  }

  // Funkcja do zapisywania rezerwacji
  async saveCyclicAvailabilities(): Promise<void> {
    const { startDate, endDate, selectedDays, startTime, endTime } = this.availabilityForm;
    
    // Sprawdzamy, czy wszystkie pola są wypełnione
    if (!startDate || !endDate || !startTime || !endTime) {
      alert('Please fill out all fields.');
      return;
    }
    // Sprawdzamy, czy data początkowa jest przed datą końcową
    const start = new Date(startDate); // Data początkowa
    const end = new Date(endDate); // Data końcowa
    const newSlots: string[] = []; // Nowe sloty
    
    // Iterujemy przez wszystkie daty od początku do końca
    for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
      const dayName = currentDate.toLocaleString('en-US', { weekday: 'long' });
      if (selectedDays[dayName]) {
        const daySlotStart = new Date(currentDate);
        const daySlotEnd = new Date(currentDate);
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
  
        daySlotStart.setHours(startHour, startMinute);
        daySlotEnd.setHours(endHour, endMinute);
  
        while (daySlotStart < daySlotEnd) {
          const slotKey = `${this.formatDate(daySlotStart)}_${this.formatTime(daySlotStart)}`;
          newSlots.push(slotKey);
          daySlotStart.setMinutes(daySlotStart.getMinutes() + 30);
        }
      }
    }
  
    try {
      // Pobierz istniejące dostępności
      const existingSlots = await this.firebaseService.getDoctorAvailabilities(this.doctorId!);
  
      // Połącz istniejące dostępności z nowymi
      const mergedSlots = Array.from(new Set([...existingSlots, ...newSlots]));
  
      // Zapisz połączoną dostępność
      await this.firebaseService.saveDoctorAvailabilities(this.doctorId!, mergedSlots);
  
      alert('Cyclic availabilities added successfully!');
      await this.loadAvailabilitiesFromFirebase(); // Odśwież dostępność w widoku
    } catch (error) {
      console.error('Error saving cyclic availabilities:', error);
    }
  }
  
  
  

  // Formatowanie czasu na format "HH:mm"
  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    // return ${hours}:${minutes};
    return `${hours}:${minutes}`;
  }

  // Funkcja do walidacji czasu
  validateTime(event: any): void {
    const value = event.target.value;
    const [hours, minutes] = value.split(':');
  
    // Ustawienie minut na poprawne wartości
    if (minutes !== '00' && minutes !== '30') {
      event.target.value = `${hours}:${minutes < '30' ? '00' : '30'}`;
    }
  }

  // Funkcja do zapisywania rezerwacji
  blockKeyboardInput(event: KeyboardEvent): void {
    event.preventDefault(); // Blokuje wszelkie wprowadzanie z klawiatury
  }

  // Funkcja do pobierania końca tygodnia
  getEndOfWeek(startOfWeek: Date): Date {
    const end = new Date(startOfWeek);
    end.setDate(startOfWeek.getDate() + 6); 
    return end;
  }

  // Funkcja do formatowania daty z miesiącem
  formatDateWithMonth(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options); 
  }

  

  /// Sprawdza, czy slot jest zarezerwowany
  isReservedSlot(day: Date, time: string): boolean {
    const slotDate = formatDate(day, 'yyyy-MM-dd', 'en-US'); // Podano trzeci argument 'en-US'
    const slot = slotDate + '_' + time;
  
    return this.reservations.some((reservation) => reservation.date === slot);
  }
  
  getPatientName(day: Date, time: string): string {
    const slotDate = formatDate(day, 'yyyy-MM-dd', 'en-US');
    const slot = slotDate + '_' + time;
  
    const reservation = this.reservations.find((res) => res.date === slot);
    return reservation ? reservation.patientName : '';
  }
  

  async getDoctorReservations() {
    const doctorId = 'your-doctor-id'; // Zmień na ID aktualnego lekarza
    try {
      this.reservations = await this.firebaseService.getReservationsByDoctor(doctorId);
    } catch (error) {
      console.error('Błąd podczas pobierania rezerwacji lekarza:', error);
    }
  }

  


}