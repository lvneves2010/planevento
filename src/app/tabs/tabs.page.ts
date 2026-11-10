import { Component, OnInit, inject } from '@angular/core';
import { AnunciosService } from '../services/anuncios.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  private anuncios = inject(AnunciosService);

  ngOnInit() {
    // o banner só aparece depois da abertura, nas telas internas
    this.anuncios.mostrarBanner();
  }
}
