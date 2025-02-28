import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FormAppComponent} from './components/form-app/form-app.component';

@Component({
  selector: 'app-root',
  imports: [FormAppComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'zad4';
}
