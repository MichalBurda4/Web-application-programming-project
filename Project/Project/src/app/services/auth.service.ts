import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, DocumentData } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs'; // Importowanie obserwatora zachowania który jest wykorzystywanay do 
//przekazywania statusu użytkownika między komponentami bez konieczności ponownego odpytania serwera.

@Injectable({
  providedIn: 'root',
})

//BehaviorSubject przechowuje stan logowania użytkownika i pozwala na jego obserwowanie.
export class AuthService {
  //Użycie BehaviorSubject do przechowywania stanu użytkownika
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Inicjalizacja obserwatora aktualnie zalogowanego użytkownika
  //Aktualizacja stanu użytkownika przy zmianie statusu autoryzacji
  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, this.updateCurrentUser);
  }

  // Rejestracja
  async register(email: string, password: string, role: string, firstName: string, lastName: string, specialization?: string): Promise<void> {
    const userData = this.constructUserData(email, role, firstName, lastName, specialization); // Tworzenie danych użytkownika

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password); // Tworzenie użytkownika W Firebase Auth
      await this.saveUserData(userCredential.user.uid, userData); // Zapisywanie danych użytkownika do kolekcji 'users'
      console.log('Użytkownik zarejestrowany:', userData); // Logowanie zarejestrowanego użytkownika
    } catch (error) {
      this.handleError(error, 'Rejestracja nieudana'); 
    }
  }

  // Tworzenie danych użytkownika
  private constructUserData(email: string, role: string, firstName: string, lastName: string, specialization?: string): Record<string, any> {
    const userData: Record<string, any> = { email, role, firstName, lastName };
    if (role === 'doctor' && specialization) {
      userData['specialization'] = specialization;
    }
    return userData;
  }

  // Zapisywanie danych użytkownika do kolekcji 'users'
  private async saveUserData(uid: string, userData: Record<string, any>): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userDocRef, userData);
  }


  // Logowanie
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password); // Logowanie użytkownika Sprawdzanie czy użytkownik istnieje w Firebase Auth
      console.log('Zalogowano pomyślnie:', email);
    } catch (error) {
      this.handleError(error, 'Logowanie nieudane');
    }
  }
  //Firebase automatycznie aktualizuje stan użytkownika dzięki nasłuchiwaniu zdarzenia za pomocą metody:
  //Gdy użytkownik zostanie pomyślnie zalogowany, metoda updateCurrentUser ustawia go w BehaviorSubject, umożliwiając komponentom subskrypcję i śledzenie zmian.
  // Aktualizacja obserwatora aktualnie zalogowanego użytkownika
  //Funkcja aktualizacji użytkownika w Observable
  private updateCurrentUser = (user: User | null) => {
    this.currentUserSubject.next(user);
  };

  //Uzyskiwanie dostępu do Observable
  getCurrentUserObservable() { // Pobieranie obserwatora aktualnie zalogowanego użytkownika
    return this.currentUserSubject.asObservable();
  }

  getCurrentUser(): User | null { // Pobieranie aktualnie zalogowanego użytkownika
    return this.currentUserSubject.value;
  }

  // Pobieranie danych użytkownika z kolekcji 'users'
  async getUserRole(uid: string): Promise<string> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return userDoc.data()['role'];
      } else {
        throw new Error('Nie znaleziono użytkownika');
      }
    } catch (error) {
      this.handleError(error, 'Nie udało się pobrać roli użytkownika');
      throw error; 
    }
  }


  // Wylogowanie
  async logout(): Promise<void> {
    try {
      await this.auth.signOut(); //Metoda this.auth.signOut() jest wywoływana, aby wylogować użytkownika z Firebase Authentication.
      console.log('Wylogowano pomyślnie');
    } catch (error) {
      this.handleError(error, 'Wylogowanie nieudane');
    }
  }


  // Obsługa błędów
  private handleError(error: unknown, message: string): void {
    if (error instanceof Error) {
      console.error(message + ':', error.message);
      throw new Error(message + ': ' + error.message);
    }
    console.error(message + ': Nieznany błąd');
    throw new Error(message + ': Nieznany błąd');
  }
}
