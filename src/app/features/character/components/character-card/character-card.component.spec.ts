import { TestBed } from '@angular/core/testing';
import { CharacterCardComponent } from './character-card.component';

describe('CharacterCardComponent portrait placeholder', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterCardComponent],
    }).compileComponents();
  });

  it('renderuje placeholder, gdy nie podano portraitUrl', async () => {
    const fixture = TestBed.createComponent(CharacterCardComponent);
    fixture.componentInstance.portraitUrl = undefined;
    fixture.componentInstance.avatarUrl = '/assets/avatar-placeholder.png';
    fixture.detectChanges();
    await fixture.whenStable();

    const img = (fixture.nativeElement as HTMLElement).querySelector(
      '.portrait img',
    ) as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img!.getAttribute('src')).toBe('/assets/avatar-placeholder.png');
    expect(img!.getAttribute('alt')).toContain('Portret');
  });
});
