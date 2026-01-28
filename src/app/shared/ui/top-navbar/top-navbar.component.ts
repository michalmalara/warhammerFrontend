import {Component, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';

import {AuthService} from '../../../features/auth/services/auth.service';
import {AuthSessionService} from '../../../features/auth/services/auth-session.service';

export type NavLink = {
  label: string;
  path: string;
};

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.scss',
})
export class TopNavbarComponent {
  @Input() links: NavLink[] = [];
  @Input() title = 'Warhammer';

  // Inject auth services and router
  private readonly auth = inject(AuthService);
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);

  // Helpers used from template (signals exposed as functions for template typechecking)
  isLogged = () => this.session.isLoggedIn();

  onLogout = () => {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  };
}
