import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { WeeklyCalendarComponent } from './components/doctor-interface/doctor-interface.component';
import { ClientInterfaceComponent } from './components/client-interface/client-interface.component';
import { GuestComponent } from './components/guest/guest.component';

export const routes: Routes = [
  // Domyślna ścieżka przekierowująca do GuestComponent
  {
    path: '',
    component: GuestComponent,
  },
  
  // Strony publiczne
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },

  // Obszar dostępny tylko dla lekarzy
  {
    path: 'doctor',
    component: WeeklyCalendarComponent,
    data: { role: 'doctor' },
  },

  // Obszar dostępny tylko dla pacjentów
  {
    path: 'patient',
    component: ClientInterfaceComponent,
    data: { role: 'patient' },
  },

  // Strona dla użytkowników bez uprawnień
  {
    path: 'guest',
    component: GuestComponent,
  },

  // Obsługa nieprawidłowych ścieżek
  {
    path: '**',
    redirectTo: '',
  },
];