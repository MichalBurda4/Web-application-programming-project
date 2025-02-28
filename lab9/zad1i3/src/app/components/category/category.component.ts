import { Component, EventEmitter, Output } from '@angular/core';
import { AnimalService } from '../../services/animal.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {

  // Tworzymy formularz przy użyciu FormGroup i przypisujemy do niego odpowiednie kontrolki
  categoryForm: FormGroup;
  // Zdefiniowanie zdarzenia, które będzie emitowane, gdy kategoria zostanie dodana
  @Output() categoryAdded: EventEmitter<string> = new EventEmitter<string>();

  constructor(private animalService: AnimalService, private fb: FormBuilder) {
    // Inicjalizujemy formularz z kontrolką "categoryName"
    this.categoryForm = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(3)]], // Walidacja - wymagane oraz minimalna długość 3
    });
  }

  // Metoda wywoływana po wysłaniu formularza
  onSubmit(): void {
    if (this.categoryForm.valid) {
      const newCategory = this.categoryForm.value.categoryName;
      this.animalService.addCategory(newCategory).subscribe({
        next: () => {
          this.categoryAdded.emit(newCategory);
          this.categoryForm.reset();
        },
        error: (err) => console.error('Error adding category:', err),
      });
    }
  }

}
