import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EventosService } from '../../services/eventos.service';
import { FinanceiroService } from '../../services/financeiro.service';
import { EventoGet } from '../../models/evento-get.model';

@Component({
  selector: 'app-financeiro-categoria-form',
  templateUrl: './financeiro-categoria-form.page.html',
  styleUrls: ['./financeiro-categoria-form.page.scss'],
  standalone: false
})
export class FinanceiroCategoriaFormPage {
  private eventosService = inject(EventosService);
  private financeiroService = inject(FinanceiroService);
  private router = inject(Router);

  nome = '';
  evento?: EventoGet;
  carregando = false;

  ionViewWillEnter() {
    this.carregarEvento();
  }

  carregarEvento() {
    this.eventosService.getEventoAtivo().subscribe({
      next: evento => {
        if (!evento) {
          this.router.navigateByUrl('/evento');
          return;
        }
        this.evento = evento;
      },
      error: () => this.router.navigateByUrl('/evento')
    });
  }

  salvar() {
    if (!this.evento || this.carregando || !this.nome.trim()) return;

    this.carregando = true;

    this.financeiroService
      .criarCategoria(this.evento.id, this.nome.trim())
      .subscribe({
        next: () => {
          this.carregando = false;
          this.router.navigateByUrl('/financeiro');
        },
        error: err => {
          console.error('Erro ao criar categoria financeira', err);
          this.carregando = false;
        }
      });
  }
}