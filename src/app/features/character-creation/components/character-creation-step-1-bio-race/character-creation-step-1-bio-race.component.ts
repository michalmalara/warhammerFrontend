import {CommonModule} from '@angular/common';
import {Component, computed, effect, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';

import {CharacterCreationStateService} from '../../services/character-creation-state.service';
import type {CharacterRace} from '../../models/character-creation.models';

type RaceCard = {
  id: CharacterRace;
  label: string;
  description: string;
  imageUrl: string;
};

@Component({
  selector: 'app-character-creation-step-1-bio-race',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './character-creation-step-1-bio-race.component.html',
  styleUrls: ['./character-creation-step-1-bio-race.component.scss'],
})
export class CharacterCreationStep1BioRaceComponent {
  private readonly fb = inject(FormBuilder);
  private readonly state = inject(CharacterCreationStateService);
  private readonly router = inject(Router);

  readonly races: RaceCard[] = [
    {
      id: 'human',
      label: 'Human',
      description: 'Versatile and ambitious citizens of the Empire.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLZali025oVPTh0EqHQlkFIRsQ0KsLhWfkpiNNwWP9E8YhZTUJMz3ZBICddKh1vVHpbBMAS7UZwmYZVmOzDOorrMRR_2MzFANBmhNw1NqriUl8Qy_5dBZ98Evxn4UpZjUW7NWq9ey1co7YNYkcB9Rr4zuVtQVMP2Oucq1HhONEW0yXubMxafJAap9B0KCTXAHRtAoIHTRzHt_ECVVvV6VIAYQA7Xk5mCyQfFHcZvFHYKk9OQHgC2rhbdNgpV83kcFKU_A57Vcrp_3-',
    },
    {
      id: 'dwarf',
      label: 'Dwarf',
      description: 'Stout, stubborn, and masters of the mountain.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDidVW7rwkUnz0ImwGbySImoodBXX8-UJcUwo5_kPlqTHG_h5V-RYWMrR-5asKy5K_9eB-ppobRZi2dMArZtQLQdDoPbW0GYT6DSKXzXXpWXTOQSWZU9c94Qpl4eTD8L6AgwMoJ61i3_arJcvdTFiSLPxyNsx1_VCpF1rysPeB-5YR4XYqNeomkYrf_czeqZjimv6iBEu_n3_TiNLjxGDSQACpgSWu4d36RoxKtPyPAXnJ2Xusrp5maHGfrN-870sA9YUgZn4VjmVvA',
    },
    {
      id: 'elf',
      label: 'Elf',
      description: 'Ancient, graceful, and aloof masters of magic.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuDRLyoRtGPevN5tIgGPLcuqD2uZStm1nfNzhMFaByD0TrcGxD_IElXnw6Yd4js7I3WXBA7F-7ktdJOtkDz8mK9HCO0T4el8auvCHGuMui1Z246aUxRPsxb5SsFFQXRTU4gp6KGxiZ37yLhk02epBb3F_n50VofLQx6bXJ9jWMtdWUZ7sziGY8qRQMjR-lBO_rdVlfn75S9cGX3HouWs8iPuEJthOmVF90C1XJ0C6BqKeRsn8s86mKIcaMqJeZfGivVMLak6ghgFxK',
    },
    {
      id: 'halfling',
      label: 'Halfling',
      description: 'Small, nimble, and surprisingly resilient.',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlmJgzFIYy8VExOeUuO4FCLbhoxKx1Yd4t19aoa1Xw1tY-j7AGmqvrczeUZAYc0FzPMT4_ltBiaNvMLqg6uiDdcnGHuEWpQQUAq09X0NK7GjhEaOdD7JGycdcXT-b8q2T8YfbjL_Cx2CfEETVotx2986yBdLRzlzGc7BTjXaLEI88QrVw1fikfYxnUcWTX-fD2kTWVDP3vP3CJnIhcJnPnl7EO0MISIurbw3QERnhMNpgFeyulHiXZNBP5rronZIk-MQ7swSbUKmp7',
    },
  ];

  readonly selectedRace = computed(() => this.state.step1().race);

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
    // init from state
    effect(() => {
      const s = this.state.step1();
      this.form.patchValue(s.bio, {emitEvent: false});
    });

    this.form.valueChanges.subscribe((value) => {
      this.state.patchBio({
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

  selectRace(race: CharacterRace) {
    this.state.setRace(race);
  }

  goPrev() {
    void this.router.navigate(['/character']);
  }

  goNext() {
    if (!this.state.step1().race || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // placeholder for step-2
    void this.router.navigate(['/character/create/step-2']);
  }
}
