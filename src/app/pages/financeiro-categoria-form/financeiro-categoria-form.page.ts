import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { EventosService } from '../../services/eventos.service';
import { FinanceiroService } from '../../services/financeiro.service';
import { EventoGet } from '../../models/evento-get.model';
import { FinanceiroCategoria } from '../../models/financeiro-categoria.model';

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
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  nome = '';
  categorias: FinanceiroCategoria[] = [];
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
        this.nome = '';
        this.carregarCategorias();
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

  private carregarCategorias() {
    if (!this.evento) return;
    this.financeiroService
      .getCategoriasPorEvento(this.evento.id)
      .subscribe(c => (this.categorias = c));
  }

  async confirmarExclusao(categoria: FinanceiroCategoria) {
    const alerta = await this.alertController.create({
      header: 'Excluir categoria',
      message: `Excluir "${categoria.nome}"? As despesas dela continuam, mas ficam sem categoria.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            if (!this.evento) return;
            this.financeiroService.deletarCategoria(this.evento.id, categoria.id).subscribe({
              next: async () => {
                this.categorias = this.categorias.filter(c => c.id !== categoria.id);
                const toast = await this.toastController.create({
                  message: 'Categoria removida.',
                  duration: 2000,
                  color: 'success',
                  position: 'bottom'
                });
                await toast.present();
              },
              error: err => console.error('Erro ao excluir categoria', err)
            });
          }
        }
      ]
    });
    await alerta.present();
  }
}
