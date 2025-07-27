import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {PopupForm} from '../../shared/components/popup-form/popup-form';

@Component({
  selector: 'footer-component',
  imports: [
    RouterLink,
    MatButton
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  private readonly _dialog = inject(MatDialog);

  protected _openForm(): void {
    this._dialog.open(PopupForm, {
      panelClass: 'popup-form',
    });
  }
}
