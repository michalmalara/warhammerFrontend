import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {FatePointsComponent} from './fate-points.component';

describe('FatePointsComponent', () => {
  it('renders title and dots', async () => {
    await TestBed.configureTestingModule({imports: [FatePointsComponent]}).compileComponents();

    const fixture = TestBed.createComponent(FatePointsComponent);
    fixture.componentInstance.fateMax = 4;
    fixture.componentInstance.fateCurrent = 3;
    fixture.componentInstance.fortuneCurrent = 2;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Fate Points');

    const dots = fixture.debugElement.queryAll(By.css('.dot'));
    const filled = fixture.debugElement.queryAll(By.css('.dot.filled'));

    expect(dots.length).toBe(4);
    expect(filled.length).toBe(3);
  });
});

