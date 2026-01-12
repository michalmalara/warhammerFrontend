import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';

import {type NavLink, TopNavbarComponent} from './top-navbar.component';

describe('TopNavbarComponent', () => {
  it('should render provided links', async () => {
    const links: NavLink[] = [
      {label: 'One', path: '/one'},
      {label: 'Two', path: '/two'},
    ];

    await TestBed.configureTestingModule({
      imports: [TopNavbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(TopNavbarComponent);
    fixture.componentInstance.links = links;
    fixture.detectChanges();
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const rendered = Array.from(el.querySelectorAll('.top-navbar__link')).map((a) =>
      a.textContent?.trim()
    );

    expect(rendered).toEqual(['One', 'Two']);
  });
});
