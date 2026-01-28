import type {NavLink} from './shared/ui/top-navbar/top-navbar.component';

export const NAV_LINKS: NavLink[] = [
  {label: $localize`:Navigation@@nav.characters:Characters`, path: '/characters'},
  {label: $localize`:Navigation@@nav.professions:Professions`, path: '/professions'},
  {label: $localize`:Navigation@@nav.skills:Skills`, path: '/skills'},
  {label: $localize`:Navigation@@nav.talents:Talents`, path: '/talents'},
];
