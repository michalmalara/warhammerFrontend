import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';

  isBusy = signal(false);
  errorMessage = signal<string | null>(null);

  busy = () => this.isBusy();
  hasError = () => !!this.errorMessage();

  onSubmit = () => {
    this.errorMessage.set(null);
    this.isBusy.set(true);

    this.auth
      .login(this.username, this.password)
      .pipe(finalize(() => this.isBusy.set(false)))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
          void this.router.navigateByUrl(returnUrl);
        },
        error: () => {
          this.errorMessage.set('Invalid username or password.');
        },
      });
  };
}
