import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fromEvent, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DataService } from './services/data.service';
import { CommonModule } from '@angular/common';
import { MenuComponent } from "./components/menu/menu.component";
import { ReportType } from './ReportType';
import { MainComponent } from "./components/main/main.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HttpClientModule, MenuComponent, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [DataService]
})
export class AppComponent {
  title = 'Raporty Produktowe';
  categories: string[] = [];
  report: ReportType = [];
  mainSection: string[] = [];

  @ViewChild('categoryInput') categoryInput!: ElementRef;

  constructor(private dataService: DataService) {}

  ngAfterViewInit() {
    fromEvent(this.categoryInput.nativeElement, 'input').pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(() => {
        this.categories = this.categoryInput.nativeElement.value.split(',');
        return this.dataService.fetchDataForCategories(this.categories);
      })
    ).subscribe((data) => {
      this.report = this.mergeData(data);
      console.log(this.report);
      this.refreshTable();
    });
  }

  mergeData(data: any[]): { category: string; items: any[] }[] {
    const mergedCategories: { [key: string]: Set<any> } = {};

    data.forEach((fileData) => {
      Object.keys(fileData).forEach((category) => {
        if (!mergedCategories[category]) {
          mergedCategories[category] = new Set();
        }
        fileData[category].forEach((item: any) => {
          mergedCategories[category].add(JSON.stringify(item));
        });
      });
    });

    return Object.keys(mergedCategories).map((category) => ({
      category,
      items: Array.from(mergedCategories[category]).map((item) => {
        let itemParsed = JSON.parse(item)

        return {...itemParsed, checked:false}
      }),
    }));
  }

  refreshTable(){
    this.mainSection = this.report.map(el=>el.items.filter(item=>item.checked).map(item=>item.nazwa)).flat();
    console.log(this.mainSection);
  }
}
