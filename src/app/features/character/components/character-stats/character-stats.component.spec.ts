import { CharacterStatsComponent } from './character-stats.component';

describe('CharacterStatsComponent.statTotal', () => {
  let component: CharacterStatsComponent;

  beforeEach(() => {
    component = new CharacterStatsComponent();
  });

  it('dla primary liczy base + adv*5', () => {
    expect(component.statTotal({ label: 'WS', base: 30, adv: 3 }, 'primary')).toBe(45);
  });

  it('dla secondary liczy base + adv (bez mnożnika)', () => {
    expect(component.statTotal({ label: 'Wounds', base: 30, adv: 3 }, 'secondary')).toBe(33);
  });

  it('gdy total jest podany, ma priorytet (nie dolicza adv)', () => {
    expect(component.statTotal({ label: 'WS', base: 30, adv: 3, total: 99 }, 'primary')).toBe(99);
    expect(component.statTotal({ label: 'Wounds', base: 30, adv: 3, total: 99 }, 'secondary')).toBe(
      99,
    );
  });

  it('brakujące base/adv traktuje jako 0', () => {
    expect(component.statTotal({ label: 'WS', adv: 2 }, 'primary')).toBe(10);
    expect(component.statTotal({ label: 'Wounds', adv: 2 }, 'secondary')).toBe(2);
    expect(component.statTotal({ label: 'WS', base: 30 }, 'primary')).toBe(30);
  });
});
