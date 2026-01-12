import { TestBed } from '@angular/core/testing';
import { SkillsComponent } from './skills.component';
import { CharacterSkill } from './skills.types';

describe('SkillsComponent', () => {
  const skills: CharacterSkill[] = [
    {
      id: '1',
      skill: { id: 'sk1', name: 'Animal Care', characteristic: 'INT' },
      basePercent: 29,
      taken: true,
      advPlus10: false,
      advPlus20: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsComponent],
    }).compileComponents();
  });

  it('renders skill name and percent', async () => {
    const fixture = TestBed.createComponent(SkillsComponent);
    fixture.componentInstance.skills = structuredClone(skills);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Animal Care');
    expect(el.textContent).toContain('29%');
  });

  it('toggles +10 and updates displayed percent', async () => {
    const fixture = TestBed.createComponent(SkillsComponent);
    fixture.componentInstance.skills = structuredClone(skills);
    fixture.componentInstance.disabled = false;
    fixture.detectChanges();

    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button.chip'),
    ) as HTMLButtonElement[];

    const plus10 = buttons.find((b) => (b.textContent ?? '').includes('+10%'));
    expect(plus10).toBeTruthy();

    plus10!.click();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('39%');
  });
});
