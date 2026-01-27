import {CommonModule} from '@angular/common';
import {Component, computed, effect, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {WaxSealButtonComponent} from '../../../../shared/ui/wax-seal-button/wax-seal-button.component';
import {BreadcrumbsComponent} from '../../../../shared/ui/breadcrumbs/breadcrumbs.component';

import type {CharacterRace} from '../../models/character-creation.models';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatRippleModule} from '@angular/material/core';
import {CharacterDataService} from '../../services/character-data.service';
import {NameService} from '../../../common/services/name.service';

type RaceCard = {
  id: CharacterRace;
  label: string;
  description: string;
  // separate portraits by gender
  maleImageUrl: string;
  femaleImageUrl: string;
};

@Component({
  selector: 'app-character-creation-step-1-bio-race',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    WaxSealButtonComponent,
    BreadcrumbsComponent,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRippleModule,
  ],
  templateUrl: './character-creation-step-1-bio-race.component.html',
  styleUrls: ['./character-creation-step-1-bio-race.component.scss'],
})
export class CharacterCreationStep1BioRaceComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly charData = inject(CharacterDataService);
  private readonly nameService = inject(NameService);

  readonly races: RaceCard[] = [
    {
      id: 'human',
      label: 'Human',
      description: 'Versatile and ambitious citizens of the Empire.',
      maleImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLZali025oVPTh0EqHQlkFIRsQ0KsLhWfkpiNNwWP9E8YhZTUJMz3ZBICddKh1vVHpbBMAS7UZwmYZVmOzDOorrMRR_2MzFANBmhNw1NqriUl8Qy_5dBZ98Evxn4UpZjUW7NWq9ey1co7YNYkcB9Rr4zuVtQVMP2Oucq1HhONEW0yXubMxafJAap9B0KCTXAHRtAoIHTRzHt_ECVVvV6VIAYQA7Xk5mCyQfFHcZvFHYKk9OQHgC2rhbdNgpV83kcFKU_A57Vcrp_3-',
      femaleImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYz07aCLkDeAJKZzmFbTzWC1SjZN6trEb6oTeK2Hv--GsZsAsppAIWQ9NsPO4kyEqLjdxGOHUhjH5uIaygZ7euETabrsn779ISclwVQ4FTJYix2okwHzM1rKFwZam_kzPOg4yhp00M5qlfAsMkIL67i9u-O4VF1bw5Ieab05AM09XTXdV-CAfMQpx7RqfJwjutquGN5J0k5OqtTmqLmtZ5ILytz401duXY4y3_Ri6H63WC-ZEIpmZr0rYdV5oHHEAxVLeg2t0tgUgC',
    },
    {
      id: 'dwarf',
      label: 'Dwarf',
      description: 'Stout, stubborn, and masters of the mountain.',
      maleImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDidVW7rwkUnz0ImwGbySImoodBXX8-UJcUwo5_kPlqTHG_h5V-RYWMrR-5asKy5K_9eB-ppobRZi2dMArZtQLQdDoPbW0GYT6DSKXzXXpWXTOQSWZU9c94Qpl4eTD8L6AgwMoJ61i3_arJcvdTFiSLPxyNsx1_VCpF1rysPeB-5YR4XYqNeomkYrf_czeqZjimv6iBEu_n3_TiNLjxGDSQACpgSWu4d36RoxKtPyPAXnJ2Xusrp5maHGfrN-870sA9YUgZn4VjmVvA',
      femaleImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGAg54QW7PIu9JRPi_xJ7-dEXfKQ6hSo04S5Zk8_TisAKthfSGXgi94cKA_nRgUqGw0OGFueowNVa43h17s9Pq4wiAvfa3Upy-qn6kkyQG5ojgm2pznlTvcYY3mvmgC0r-v6aAmFBRewsdTK_gNUKyTkg6AC6cBKOrxleWybxo5y8bT10d9v60I6HIWt2hteOrkmwaoF8rwelk_mbqBQSBbQx5nMkUeY5R_zKwgzIgruHQHeCEC88XwRDMEHyylnXEO6LUl1J6jm95'
    },
    {
      id: 'elf',
      label: 'Elf',
      description: 'Ancient, graceful, and aloof masters of magic.',
      femaleImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuDRLyoRtGPevN5tIgGPLcuqD2uZStm1nfNzhMFaByD0TrcGxD_IElXnw6Yd4js7I3WXBA7F-7ktdJOtkDz8mK9HCO0T4el8auvCHGuMui1Z246aUxRPsxb5SsFFQXRTU4gp6KGxiZ37yLhk02epBb3F_n50VofLQx6bXJ9jWMtdWUZ7sziGY8qRQMjR-lBO_rdVlfn75S9cGX3HouWs8iPuEJthOmVF90C1XJ0C6BqKeRsn8s86mKIcaMqJeZfGivVMLak6ghgFxK',
      maleImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpkuxbpiu3Sk9V0ykKW5Y9KHd5XOwWdEacT-HKgmA7Ig8I6oJxBWZ6-3y1JDvham0JX_Q7OvkJD40WXGoaxYdMtQPE5JFq2olOPm11pQNwx5tzl1xdCjq-Pyf5EnCOZqr4DoXuwAfLObg9ixYOGrFrBA2xPVRr9I82-3Yi4SpE1epL6aPf1oLnFj2JOyGnwh_QZqUWCwV7Ns2EapccTWIqWADk2fA3dQ73UEAHs-dJ-Mr24xIuiHzqrcfDo8rfaXJlakafZRAmaQjP',
    },
    {
      id: 'halfling',
      label: 'Halfling',
      description: 'Small, nimble, and surprisingly resilient.',
      femaleImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlmJgzFIYy8VExOeUuO4FCLbhoxKx1Yd4t19aoa1Xw1tY-j7AGmqvrczeUZAYc0FzPMT4_ltBiaNvMLqg6uiDdcnGHuEWpQQUAq09X0NK7GjhEaOdD7JGycdcXT-b8q2T8YfbjL_Cx2CfEETVotx2986yBdLRzlzGc7BTjXaLEI88QrVw1fikfYxnUcWTX-fD2kTWVDP3vP3CJnIhcJnPnl7EO0MISIurbw3QERnhMNpgFeyulHiXZNBP5rronZIk-MQ7swSbUKmp7',
      maleImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUoT3hWV_uImD7ZmGog82Y3B7i9hVWVssohOML8Wb9fNcqgteTNILinr-AC2Rq4l5WalKRMJFw2FUXVBKKGTv8ZPFzS6r318odFNglDMbo-9J72zpkaaJ5wjXwfsYBSzcIX5PgjZboq9vfVtKeKQXvQHPx611gmr4fN5LNXNbI6k9MqlhseYPACgNxQsai70S0SbDbrUgT8AtpfGDtga4u7dPI-5RiUtg38UmMjXIz4kQu8WnCZPOvulZ6kcYziml6sZVo_GBooInM',
    },
  ];

  readonly selectedRace = computed(() => this.charData.race());

  readonly form = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(80)]),
    gender: this.fb.nonNullable.control<'male' | 'female' | 'other'>('male', [Validators.required]),
    age: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(500)]),
    starSign: this.fb.nonNullable.control('The Drummer', [Validators.required]),
    eyeColor: this.fb.nonNullable.control('Hazel', [Validators.required]),
    hairColor: this.fb.nonNullable.control('Ash Blonde', [Validators.required]),
    physicalMarkings: this.fb.nonNullable.control('', [Validators.maxLength(120)]),
  });

  constructor() {
    // init from state (race stays in CharacterCreationStateService; bio moved to CharacterDataService)
    effect(() => {
      const bio = this.charData.bio();
      this.form.patchValue(bio, {emitEvent: false});
    });

    this.form.valueChanges.subscribe((value) => {
      this.charData.patchBio({
        name: value.name ?? '',
        gender: (value.gender ?? 'male') as any,
        age: value.age ?? null,
        starSign: value.starSign ?? 'The Drummer',
        eyeColor: value.eyeColor ?? 'Hazel',
        hairColor: value.hairColor ?? 'Ash Blonde',
        physicalMarkings: value.physicalMarkings ?? '',
      });
    });
  }

  // Called after clicking the 'draw name' button
  onDrawRandomName(): void {
    const race = this.charData.race();
    const gender = this.form.controls.gender.value;
    if (!race || !gender) return;

    this.nameService.getRandomName(race, gender).subscribe(res => {
      const full = `${res.firstName}${res.lastName ? ' ' + res.lastName : ''}`;
      this.form.controls.name.setValue(full);
    });
  }

  // Draws an age in a sensible range depending on race and sets the age control
  onDrawRandomAge(): void {
    const race = this.charData.race();
    // define sensible age ranges per race
    const ranges: Record<string, [number, number]> = {
      human: [16, 50],
      dwarf: [20, 150],
      elf: [50, 700],
      halfling: [20, 120],
    } as any;

    const [min, max] = ranges[race ?? 'human'] ?? [16, 80];
    const roll = Math.floor(Math.random() * (max - min + 1)) + min;
    this.form.controls.age.setValue(roll);
  }

  selectRace(race: CharacterRace) {
    this.charData.setRace(race);
    // After changing race, clear name and age and reset touched status to avoid showing errors immediately
    this.form.controls.name.setValue('');
    this.form.controls.name.markAsUntouched();
    this.form.controls.age.setValue(null);
    this.form.controls.age.markAsUntouched();
  }

  goPrev() {
    void this.router.navigate(['/character']);
  }

  goNext() {
    if (!this.charData.race() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // placeholder for step-2
    void this.router.navigate(['/character/create/step-2']);
  }
}
