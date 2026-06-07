import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-settings-button',
  standalone: true,
  templateUrl: './product-settings-button.component.html',
})
export class ProductSettingsButtonComponent {
  @Output() open = new EventEmitter<void>();
}
