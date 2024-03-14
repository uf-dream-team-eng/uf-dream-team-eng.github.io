import { Component } from '@angular/core';
import { ProjectCardComponent } from '../project-card/project-card.component';
import {projects} from './../../../assets/projects'

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [ProjectCardComponent],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent {
  projects = projects
}
