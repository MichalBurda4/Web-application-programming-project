import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AnimalService } from '../../services/animal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  @Input() animals: any[] = [];
  @Output() edit: EventEmitter<number> = new EventEmitter<any>();
  @Output() delete: EventEmitter<number> = new EventEmitter<number>();
  @Output() toggleFavorite: EventEmitter<any> = new EventEmitter<any>();

  favoriteCount = 0;

  constructor(private animalService: AnimalService) { }
  // Metoda ładuje zwierzęta z serwisu i oblicza liczbę ulubionych zwierząt
  loadAnimals(): void {
    this.animalService.getAnimals().subscribe((data) => {
      this.animals = data
      this.favoriteCount = this.animals.filter((a) => a.favorite).length;
    });
  }

  deleteAnimal(id: number): void {
    this.delete.emit(id);
  }
  // Metoda do zmiany statusu ulubionego zwierzęcia (ulubione/nienieulubione)
  onToggleFavorite(animal: any): void {
    this.toggleFavorite.emit(animal);
    this.favoriteCount = this.animals.filter((a) => a.favorite).length;
  }
  // Wyszukiwanie zwierzęcia po ID w liście zwierząt
  editAnimal(id: number): void {
    console.log("AAA");

    const animal = this.animals.find((a) => a.id === id);
    this.edit.emit(animal);
  }
  // Metoda uruchamiana przy inicjalizacji komponentu, ładuje dane
  ngOnInit(): void {
    this.loadAnimals();
  }
}
