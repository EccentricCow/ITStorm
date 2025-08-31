import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {PopupForm} from '../../shared/components/popup-form/popup-form';

@Component({
  standalone: true,
  selector: 'footer-component',
  imports: [
    RouterLink,
    MatButton,
    RouterLinkActive
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  private readonly _dialog = inject(MatDialog);
  private readonly _router = inject(Router);

  protected _openForm(): void {
    this._dialog.open(PopupForm, {
      panelClass: 'popup-form',
    });
  }

  protected _navigateToSection(sectionId: string): void {
    this._router.navigate(['/'], {fragment: sectionId});
  }
}
