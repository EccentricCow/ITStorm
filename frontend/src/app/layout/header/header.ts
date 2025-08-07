import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatMenuTrigger} from "@angular/material/menu";
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from "../../core/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  standalone: true,
  selector: 'header-component',
  imports: [
    RouterLink,
    MatMenuTrigger,
    MatButtonModule,
    MatMenuModule,
    RouterLinkActive
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private readonly _authService = inject(AuthService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _router = inject(Router);

  protected readonly _userName = this._authService.userName;

  public logout(): void {
    this._authService.logout().subscribe({
      next: (): void => {
        this._doLogout();
      },
      error: (): void => {
        this._doLogout();
      },
    });
  }

  private _doLogout(): void {
    this._authService.removeUserInfo();
    this._snackBar.open('Вы успешно вышли из системы');
    this._router.navigate(['/']);
  }
}
