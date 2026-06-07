import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product-stock-remove-button',
  standalone: true,
  templateUrl: './product-stock-remove-button.component.html',
})
export class ProductStockRemoveButtonComponent {
  @Output() open = new EventEmitter<void>();
}
