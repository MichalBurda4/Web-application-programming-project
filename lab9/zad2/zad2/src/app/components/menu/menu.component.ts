import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemComponent } from "./item/item.component";
import { ReportType, ReportTypeElement } from '../../ReportType';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  imports: [ItemComponent,  CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  @Input() report: ReportType =[];
  @Output() reportChange = new EventEmitter();

  constructor() {}

  ngOnInit() {
    console.log(this.report);
  }

}
