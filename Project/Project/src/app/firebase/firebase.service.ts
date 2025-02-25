import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc, getDoc, setDoc, query, where } from '@angular/fire/firestore';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private firestore = inject(Firestore);

  constructor() {}

  // Pobieranie wszystkich dokumentów z kolekcji
  private async getAllDocuments(collectionName: string): Promise<any[]> {
    const querySnapshot = await getDocs(collection(this.firestore, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Pobieranie dokumentu
  private getDocumentRef(collectionName: string, docId: string) {
    return doc(this.firestore, collectionName, docId);
  }

  // Pobieranie konsultacji
  async getConsultations(): Promise<any[]> {
    return this.getAllDocuments('consultations');
  }

  // Dodawanie nowej konsultacji
  async addConsultation(data: { date: string; time: string; name: string; status: string; patientName?: string }) {
    return this.addDocument('consultations', data);
  }

  // Helper function to add a document
  private async addDocument(collectionName: string, data: any) {
    const docRef = await addDoc(collection(this.firestore, collectionName), data);
    return docRef;
  }

  //  Aktualizowanie konsultacji
  async updateConsultation(consultationId: string, data: Partial<{ date: string; time: string; status: string; patientName?: string }>) {
    return this.updateDocument('consultations', consultationId, data);
  }

  // Helper function to update a document
  private async updateDocument(collectionName: string, docId: string, data: any) {
    const docRef = this.getDocumentRef(collectionName, docId);
    await updateDoc(docRef, data);
    console.log(`${collectionName} updated with ID: `, docId);
  }

  // Usuwanie konsultacji
  async deleteConsultation(consultationId: string) {
    return this.deleteDocument('consultations', consultationId);
  }

  // Helper function to delete a document
  private async deleteDocument(collectionName: string, docId: string) {
    const docRef = this.getDocumentRef(collectionName, docId);
    await deleteDoc(docRef);
    console.log(`${collectionName} deleted with ID: `, docId);
  }

  // Pobieranie użytkowników
  async getUsers(): Promise<any[]> {
    return this.getAllDocuments('users');
  }

  // Dodawanie użytkownika
  async addUser(data: { name: string; email: string; role: string; phone?: string }) {
    return this.addDocument('users', data);
  }

  // Aktualizowanie użytkownika
  async updateUser(userId: string, data: Partial<{ name: string; email: string; role: string; phone?: string }>) {
    return this.updateDocument('users', userId, data);
  }

  // Usuwanie użytkownika
  async deleteUser(userId: string) {
    return this.deleteDocument('users', userId);
  }

  // Pobieranie rezerwacji
  async getReservations(): Promise<any[]> {
    return this.getAllDocuments('reservations');
  }

  // Dodawanie rezerwacji
  async addReservation(data: { date: string; time: string; doctorId: string; doctorName: string; patientId: string; patientName: string; type: string; gender: string; age: number | null; notes: string }) {
    try {
      const reservationSlot = `${data.date}_${data.time}`;
      await this.addDocument('reservations', data);
      await this.markSlotAsReserved(data.doctorId, reservationSlot);
      console.log('Reservation added and slot marked as reserved:', reservationSlot);
    } catch (error) {
      console.error('Error adding reservation:', error);
      throw error;
    }
  }

  // Aktualizowanie rezerwacji
  async updateReservation(reservationId: string, data: Partial<{ status: string; paymentStatus: string }>) {
    return this.updateDocument('reservations', reservationId, data);
  }

  // Usuwanie rezerwacji
  async deleteReservation(reservationId: string) {
    return this.deleteDocument('reservations', reservationId);
  }

  // Pobieranie dostępności lekarza
  async getDoctorAvailabilities(doctorId: string): Promise<string[]> {
    return this.getDocumentData('availabilities', doctorId, 'slots');
  }

  // Pomocnicza funkcja do pobierania danych dokumentu
  private async getDocumentData(collectionName: string, docId: string, fieldName: string): Promise<any> {
    const docRef = this.getDocumentRef(collectionName, docId);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return data[fieldName] || [];
    }
    return [];
  }

  // Funkcja zapisująca dostępności lekarza
  async saveDoctorAvailabilities(doctorId: string, availabilities: string[]): Promise<void> {
    try {
      const doctorAvailabilitiesDoc = this.getDocumentRef('availabilities', doctorId);
      await setDoc(doctorAvailabilitiesDoc, { slots: availabilities });
      console.log('Zapisano dostępności dla lekarza:', doctorId);
    } catch (error) {
      console.error('Błąd podczas zapisywania dostępności lekarza:', error);
      throw error;
    }
  }

  // Funkcja zapisująca dane użytkownika
  async getUserData(uid: string): Promise<any> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const userDoc = await getDoc(userDocRef);
  
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Użyj nawiasów kwadratowych do dostępu do właściwości
      return {
        firstName: data?.['firstName'],
        lastName: data?.['lastName'],
        ...data
      };
    } else {
      throw new Error('User not found');
    }
  }


  // Funkcja zapisująca dane lekarza
  async getAllDoctors(): Promise<any[]> {
    return this.getFilteredDocuments('users', 'role', 'doctor');
  }

  // Funkcja do pobierania dokumentów z określonym polem
  private async getFilteredDocuments(collectionName: string, field: string, value: string): Promise<any[]> {
    const q = query(collection(this.firestore, collectionName), where(field, '==', value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Funkcja do oznaczania slotu jako zarezerwowany
  async markSlotAsReserved(doctorId: string, slot: string): Promise<void> {
    await this.updateSlotStatus(doctorId, slot, false);
  }

  // Funkcja do oznaczania slotu jako dostępny
  async markSlotAsAvailable(doctorId: string, slot: string): Promise<void> {
    await this.updateSlotStatus(doctorId, slot, true);
  }

  // Funkcja aktualizująca status slotu
  private async updateSlotStatus(doctorId: string, slot: string, isAvailable: boolean): Promise<void> {
    const availabilitiesDoc = this.getDocumentRef('availabilities', doctorId);
    const docSnapshot = await getDoc(availabilitiesDoc);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      let slots = data['slots'] as string[];

      if (isAvailable) {
        slots.push(slot); // dodaj slot, jeśli jest dostępny
      } else {
        slots = slots.filter((availableSlot) => availableSlot !== slot); // usuń slot, jeśli jest zarezerwowany
      }

      await updateDoc(availabilitiesDoc, { slots }); // zaktualizuj dostępności
      console.log(`Slot ${slot} marked as ${isAvailable ? 'available' : 'reserved'} for doctor ${doctorId}`);
    }
  }

  // Funcja pobierająca rezerwacje lekarza
  async getReservationsByDoctor(doctorId: string): Promise<any[]> {
    const reservationsRef = collection(this.firestore, 'reservations');
    const q = query(reservationsRef, where('doctorId', '==', doctorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  }

  // Funkcja pobierająca rezerwacje pacjenta
  async getReservationsByPatient(patientId: string): Promise<any[]> {
    return this.getFilteredDocumentsByField('reservations', 'patientId', patientId);
  }

  // Funkcja pobierająca dokumenty z określonym polem
  private async getFilteredDocumentsByField(collectionName: string, field: string, value: string): Promise<any[]> {
    const q = query(collection(this.firestore, collectionName), where(field, '==', value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}
