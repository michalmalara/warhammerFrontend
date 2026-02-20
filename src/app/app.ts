import {Component, inject, OnDestroy, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {TopNavbarComponent} from './shared/ui/top-navbar/top-navbar.component';
import {NAV_LINKS} from './app.navigation';
import {AuthSessionService} from './features/auth/services/auth-session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopNavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  protected readonly title = signal('frontend');

  readonly navLinks = NAV_LINKS;

  private readonly session = inject(AuthSessionService);
  isLogged = () => this.session.isLoggedIn();

  private readonly router = inject(Router);

  ngOnDestroy(): void {
    // no-op: guard handles cleanup now
  }
}
