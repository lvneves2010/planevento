import { Component, OnDestroy, inject } from '@angular/core';
import { NavController } from '@ionic/angular';

/** Abertura (~3 s): ícone, nome do app e rodapé completo da HSI. Toque pula. */
@Component({
  selector: 'app-abertura',
  templateUrl: './abertura.page.html',
  styleUrls: ['./abertura.page.scss'],
  standalone: false
})
export class AberturaPage implements OnDestroy {
  private nav = inject(NavController);

  static readonly DURACAO_MS = 3000;

  private timer?: ReturnType<typeof setTimeout>;

  ionViewDidEnter() {
    this.timer = setTimeout(() => this.entrar(), AberturaPage.DURACAO_MS);
  }

  entrar() {
    clearTimeout(this.timer);
    this.nav.navigateRoot('/home', { animated: true, animationDirection: 'forward' });
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }
}
