import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {MatMenuTrigger} from "@angular/material/menu";
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {AuthService} from "../../core/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Subscription} from "rxjs";

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
export class Header implements OnInit, OnDestroy {
    private authService = inject(AuthService);
    private _snackBar = inject(MatSnackBar);
    private router = inject(Router);

    protected userName = '';
    private userNameSubscription: Subscription | undefined;

    ngOnInit() {
        this.userNameSubscription = this.authService.userName$
            .subscribe(name => this.userName = name);
    }

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

    ngOnDestroy() {
        this.userNameSubscription?.unsubscribe();
    }
}
