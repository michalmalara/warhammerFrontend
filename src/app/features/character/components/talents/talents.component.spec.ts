import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TalentsComponent } from './talents.component';

describe('TalentsComponent', () => {
  it('renders talent name and description', async () => {
    await TestBed.configureTestingModule({
      imports: [TalentsComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TalentsComponent);
    fixture.componentInstance.talents = [
      {
        id: 'rapid-reload',
        name: 'Rapid Reload',
        description: 'You can reload faster than normal.',
      },
    ];
    fixture.detectChanges();

    const name = fixture.debugElement.query(By.css('.name'))?.nativeElement?.textContent;
    const desc = fixture.debugElement.query(By.css('.description'))?.nativeElement?.textContent;

    expect(name).toContain('Rapid Reload');
    expect(desc).toContain('reload faster');
  });

  it('shows empty state when list is empty', async () => {
    await TestBed.configureTestingModule({
      imports: [TalentsComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(TalentsComponent);
    fixture.componentInstance.talents = [];
    fixture.detectChanges();

    const empty = fixture.debugElement.query(By.css('.empty'))?.nativeElement?.textContent;
    expect(empty).toContain('No talents');
  });
});
