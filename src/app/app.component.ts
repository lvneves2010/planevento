import { Component, inject } from '@angular/core';
import { AnunciosService } from './services/anuncios.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {
    const anuncios = inject(AnunciosService);

    // consentimento + SDK em segundo plano, enquanto a abertura aparece
    anuncios.iniciar();
  }
}
