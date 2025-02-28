import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getAnimals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/animals`);
  }

  addAnimal(animal: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/animals`, animal);
  }

  updateAnimal(id: number, animal: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/animals/${id}`, animal);
  }

  deleteAnimal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/animals/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  addCategory(category: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, { name: category });
  }
}
