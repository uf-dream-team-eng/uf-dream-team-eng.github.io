import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { EkgPageComponent } from './ekg-page/ekg-page.component';

export const routes: Routes = [
    { path: "", component: LandingPageComponent},
    { path: "ekg", component: EkgPageComponent}
];
