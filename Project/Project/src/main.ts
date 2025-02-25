// Importowanie funkcji Firebase i Angular
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router'; 
import { AppComponent } from './app/app.component'; // Importowanie głównego komponentu aplikacji i tras
import { routes } from './app/app.routes'; 
//import { environment } from './environments/environment'; // Importuj środowisko

// Inicjalizacja aplikacji Angular z dostawcami Firebase i trasami
bootstrapApplication(AppComponent, {
  providers: [
   
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Inicjalizacja aplikacji Firebase
    provideAuth(() => getAuth()), // Inicjalizacja usługi uwierzytelniania Firebase
    provideFirestore(() => getFirestore()), // Inicjalizacja usługi Firestore Firebase
    provideRouter(routes) // Inicjalizacja tras Angular
  ]
}).catch(err => console.error(err)); // Obsługa błędów inicjalizacji

// Konfiguracja Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBtWvL3MnK68GBs4zDzb5Dport7yMt1gNs",
  authDomain: "project-59e1f.firebaseapp.com",
  projectId: "project-59e1f",
  storageBucket: "project-59e1f.firebasestorage.app",
  messagingSenderId: "77386856146",
  appId: "1:77386856146:web:ae49ddd6ad3cee4b809f0b",
  measurementId: "G-3D06CFRBE3"
};