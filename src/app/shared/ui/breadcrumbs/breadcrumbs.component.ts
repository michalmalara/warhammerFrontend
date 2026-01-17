import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent {
  /** 1-based current step (1..5) */
  @Input() currentStep = 1;
  /** optional label to show next to "Step 1: Race" */
  @Input() selectedRaceLabel: string | null = null;
}
