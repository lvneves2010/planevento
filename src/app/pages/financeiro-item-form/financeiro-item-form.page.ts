import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EventosService } from '../../services/eventos.service';
import { FinanceiroService } from '../../services/financeiro.service';
import { EventoGet } from '../../models/evento-get.model';
import { FinanceiroCategoria } from '../../models/financeiro-categoria.model';

@Component({
  selector: 'app-financeiro-item-form',
  templateUrl: './financeiro-item-form.page.html',
  styleUrls: ['./financeiro-item-form.page.scss'],
  standalone: false
})
export class FinanceiroItemFormPage {
  private eventosService = inject(EventosService);
  private financeiroService = inject(FinanceiroService);
  private router = inject(Router);

  evento?: EventoGet;
  categorias: FinanceiroCategoria[] = [];
  carregando = false;

  form = {
    categoriaId: '',
    descricao: '',
    valorPrevisto: 0
  };

  ionViewWillEnter() {
    this.carregarDados();
  }

  carregarDados() {
    this.carregando = true;

    this.eventosService.getEventoAtivo().subscribe({
      next: evento => {
        if (!evento) {
          this.router.navigateByUrl('/evento');
          return;
        }

        this.evento = evento;

        this.financeiroService
          .getCategoriasPorEvento(evento.id)
          .subscribe({
            next: c => {
              this.categorias = c;
              this.carregando = false;
            },
            error: err => {
              console.error('Erro ao carregar categorias', err);
              this.carregando = false;
            }
          });
      },
      error: () => {
        this.carregando = false;
        this.router.navigateByUrl('/evento');
      }
    });
  }

  salvar() {
    if (!this.evento || this.carregando) return;

    this.carregando = true;

    this.financeiroService
      .criarItem(this.evento.id, {
        categoriaId: this.form.categoriaId,
        descricao: this.form.descricao.trim(),
        valorPrevisto: Number(this.form.valorPrevisto)
      })
      .subscribe({
        next: () => {
          this.carregando = false;
          this.router.navigateByUrl('/financeiro');
        },
        error: err => {
          console.error('Erro ao criar item financeiro', err);
          this.carregando = false;
        }
      });
  }
}