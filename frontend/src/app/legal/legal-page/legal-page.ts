import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-legal-page',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss'
})


export class LegalPage {
  data = inject(MAT_DIALOG_DATA);
}
