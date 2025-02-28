import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReportTypeElement, ReportTypeElementItem } from '../../../ReportType';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-item',
  imports: [CommonModule],
  templateUrl: './item.component.html',
  styleUrl: './item.component.css'
})
export class ItemComponent {
  @Input() reportItem!: ReportTypeElement;
  @Output() reportItemChange = new EventEmitter();
  everyChecked:boolean = false;

  constructor() {}

  ngOnInit() {
    console.log(this.reportItem);
  }

  handleInput($event: Event) {
    const target = $event.target as HTMLInputElement;
    const isChecked = target.checked;
    console.log('Element checked:', isChecked);

    this.reportItem.items.forEach(item=>item.checked = isChecked);

    this.reportItemChange.emit();
  }

  handleInputChild($event: Event, item:ReportTypeElementItem) {
    console.log(item);

    item.checked = !item.checked;

    this.everyChecked = this.ifEveryItemChecked();
    this.reportItemChange.emit();
  }

  ifEveryItemChecked():boolean{
    return this.reportItem.items.every(el=>el.checked);
  }
}
