import { Component, EventEmitter, Input, Output } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent {

  @Input() categories: any[] = [];
  @Input() animal: any = null;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  animalForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Tworzenie formularza z odpowiednimi kontrolkami i walidacją
    this.animalForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      category: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
      weight: [null, [Validators.required, Validators.min(0)]],
      favoriteFood: ['', Validators.required],
    });
  }
  // Funkcja obsługująca przesyłanie danych formularza
  onSubmit(): void {
    if (this.animalForm.valid) {
      this.save.emit(this.animalForm.value);
      this.animalForm.reset();
    }
  }

  // Funkcja obsługująca anulowanie formularza
  onCancel(): void {
    this.cancel.emit();
    this.animalForm.reset();
  }

  ngOnChanges(): void {
    if (this.animal) {
      this.animalForm.patchValue(this.animal);
    }
  }
}
