import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-form-app',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-app.component.html',
  styleUrls: ['./form-app.component.css']
})
export class FormAppComponent implements AfterViewInit {
  @ViewChild('targetElement', { static: false }) targetElement!: ElementRef;
  isVisible$!: Observable<boolean>;

  constructor() {}

  ngAfterViewInit(): void {
    this.isVisible$ = this.createAppObservable();
  }

  createAppObservable(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const intersectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          observer.next(entry.isIntersecting);
        });
      }, {
        threshold: 0.2
      });

      if (this.targetElement) {
        intersectionObserver.observe(this.targetElement.nativeElement);
      }

      return () => {
        intersectionObserver.disconnect();
      };
    }).pipe(
      debounceTime(50),
      distinctUntilChanged()
    );
  }
}
