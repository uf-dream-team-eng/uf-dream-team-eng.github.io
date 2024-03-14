import { Component } from '@angular/core';
import { AppComponentHeader } from '../landing-page/Header/header.component';

@Component({
  selector: 'app-ekg-page',
  standalone: true,
  imports: [AppComponentHeader],
  templateUrl: './ekg-page.component.html',
  styleUrl: './ekg-page.component.scss'
})
export class EkgPageComponent {

}
