import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatMenuTrigger} from "@angular/material/menu";
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from "../../core/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'header-component',
  imports: [
    RouterLink,
    MatMenuTrigger,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private authService = inject(AuthService);
  private _snackBar = inject(MatSnackBar);
  private router = inject(Router);

  protected userName = this.authService.userName;

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.doLogout();
      },
      error: () => {
        this.doLogout();
      },
    });
  }

  private doLogout(): void {
    this.authService.removeUserInfo();
    this._snackBar.open('Вы успешно вышли из системы');
    this.router.navigate(['/']);
  }
}
