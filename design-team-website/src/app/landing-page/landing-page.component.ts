import { Component } from '@angular/core';
import { AppComponentHeader } from './Header/header.component';
import { GalleryComponent } from './gallery/gallery.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [AppComponentHeader, GalleryComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
