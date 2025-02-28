import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {}

  fetchDataForCategories(categories: string[]): Observable<any[]> {
    const urls = ['A', 'B', 'C'];
    return forkJoin(urls.map((url) => this.http.get(`http://localhost:3000/${url}`))).pipe(
      map((data: any[]) => {

        console.log(data);

        const mappedData = data.map((fileData) =>
          categories.reduce<{[x: string]: any}>((acc, category) => {
            if (fileData[category]) {
              acc[category] = fileData[category];
            }
            return acc;
          }, {})
        );
        console.log(mappedData);
        return mappedData;

      })
    );
  }
}
