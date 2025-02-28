import { RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AnimalService } from './services/animal.service';
import { FormComponent } from "./components/form/form.component";
import { ListComponent } from "./components/list/list.component";
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from "./components/category/category.component";
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';


@Component({
  selector: 'app-root',
  imports: [MatFormFieldModule, MatSelectModule, RouterOutlet, FormComponent, ListComponent, CommonModule, HttpClientModule, CategoryComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [AnimalService],
})
export class AppComponent {
  animals: any[] = [];
  filteredAnimals: any[] = [];
  categories: any[] = [];
  selectedCategories: string[] = [];
  isFormVisible: boolean = false;
  favoriteAnimalsCount: number = 0;
  animalToEdit: any = null;
  categoryForms = new FormControl('');


  constructor(private animalService: AnimalService) {
    // Subskrypcja zmian w formularzu wyboru kategorii
    this.categoryForms.valueChanges.subscribe((value) => {
      const castedValue = <string[]> <never> value;
      console.log('Selected categories:', castedValue);
      this.selectedCategories = castedValue;
      this.filterAnimalsBySelectedCategories();
    });
  }

  filterAnimalsBySelectedCategories(): void {
    if (this.selectedCategories.length === 0) {
      this.filteredAnimals = [...this.animals];
    } else {
      this.filteredAnimals = this.animals.filter((animal) =>
        this.selectedCategories.includes(animal.category)
      );
    }
  }

  // Ładowanie kategorii zwierząt z serwisu
  loadCategories(): void {
    this.animalService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('Error loading categories:', err),
    });
  }
  // Ładowanie zwierząt z serwisu
  loadAnimals(): void {
    this.animalService.getAnimals().subscribe({
      next: (data) => {
        this.animals = data;
        this.filteredAnimals = data; // Initially show all animals
      },
      error: (err) => console.error('Error loading animals:', err),
    });
  }
  // Funkcja wywoływana po kliknięciu w przycisk "Dodaj zwierzę" lub edytowania istniejącego zwierzęcia
  showForm(animal?: any): void {
    this.animalToEdit = animal || null;
    this.isFormVisible = true;
  }
  // Funkcja anulująca edycję lub dodawanie zwierzęcia
  cancelForm(): void {
    this.isFormVisible = false;
    this.animalToEdit = null;
  }



  // Funkcja wywoływana przy edytowaniu zwierzęcia
  editAnimal(animal: any): void {
    this.showForm(animal);
  }

  filterAnimals(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(selectElement.selectedOptions);
    this.selectedCategories = selectedOptions.map((option) => option.value);

    // Ponowne filtrowanie zwierząt na podstawie wybranych kategorii
    if (this.selectedCategories.length === 0) {
      this.filteredAnimals = [...this.animals];
    } else {
      this.filteredAnimals = this.animals.filter((animal) =>
        this.selectedCategories.includes(animal.category)
      );
    }
  }
  // Funkcja zapisująca zwierzę (dodaje lub aktualizuje)
  saveAnimal(animal: any): void {
    if (this.animalToEdit) {
      this.animalService.updateAnimal(this.animalToEdit.id, animal).subscribe(() => {
        this.loadAnimals();
        this.isFormVisible = false;
        this.animalToEdit = null;
      });
    } else {
      this.animalService.addAnimal(animal).subscribe(() => {
        this.loadAnimals();
        this.isFormVisible = false;
      });
    }
  }
  // Funkcja do aktualizacji liczby ulubionych zwierząt
  updateFavoriteCount(): void {
    this.favoriteAnimalsCount = this.animals.filter((animal) => animal.favorite).length;
  }


  // Funkcja do usuwania zwierzęcia
  deleteAnimal(id: number): void {
    this.animalService.deleteAnimal(id).subscribe(() => {
      this.loadAnimals();
    });
  }
  // Funkcja do zmiany statusu "ulubionego" zwierzęcia
  toggleFavorite(animal: any): void {
    animal.favorite = !animal.favorite;
    this.animalService.updateAnimal(animal.id, animal).subscribe(() => {
      this.loadAnimals();
    });
  }
// Funkcja wywoływana po załadowaniu komponentu
  ngOnInit(): void {
    this.loadAnimals();
    this.loadCategories();
  }


}
