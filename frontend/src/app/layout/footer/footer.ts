import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'footer-component',
  imports: [
    RouterLink
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

}
