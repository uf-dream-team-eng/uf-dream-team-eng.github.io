import { Component } from '@angular/core';
import { GalleryComponent } from './gallery/gallery.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [GalleryComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
