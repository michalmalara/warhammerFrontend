import {Component, inject, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {TopNavbarComponent} from './shared/ui/top-navbar/top-navbar.component';
import {NAV_LINKS} from './app.navigation';
import {AuthSessionService} from './features/auth/services/auth-session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopNavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');

  readonly navLinks = NAV_LINKS;

  private readonly session = inject(AuthSessionService);
  isLogged = () => this.session.isLoggedIn();
}
