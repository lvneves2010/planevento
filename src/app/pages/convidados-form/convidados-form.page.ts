import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { EventosService } from '../../services/eventos.service';
import { ConvidadosService } from '../../services/convidados.service';
import { EventoGet } from '../../models/evento-get.model';

@Component({
  selector: 'app-convidados-form',
  templateUrl: './convidados-form.page.html',
  styleUrls: ['./convidados-form.page.scss'],
  standalone: false
})
export class ConvidadosFormPage {
  private eventosService = inject(EventosService);
  private convidadosService = inject(ConvidadosService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  evento?: EventoGet;
  carregando = false;

  form = {
    nome: '',
    email: '',
    quantidadeAcompanhantes: 0,
    observacoes: ''
  };

  private async exibirToast(mensagem: string, cor: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2200,
      color: cor,
      position: 'bottom'
    });
    await toast.present();
  }


  ionViewWillEnter() {
    this.carregarEvento();
  }

  carregarEvento() {
    this.carregando = true;

    this.eventosService.getEventoAtivo().subscribe({
      next: evento => {
        if (!evento) {
          this.router.navigateByUrl('/evento');
          return;
        }
        this.evento = evento;
        this.carregando = false;
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

    const nome = this.form.nome.trim();
    const email = this.form.email.trim();

    const payload = {
      nome,
      email,
      confirmacaoPresenca: null,
      quantidadeAcompanhantes: Number(this.form.quantidadeAcompanhantes) || 0,
      observacoes: this.form.observacoes.trim() || ''
    };

    this.convidadosService
      .criarConvidado(this.evento.id, payload)
      .subscribe({
        next: async () => {
          this.carregando = false;
          await this.exibirToast('Convidado salvo com sucesso.', 'success');
          this.router.navigateByUrl('/convidados');
        },
        error: async err => {
          console.error(err);
          this.carregando = false;
          await this.exibirToast('Nao foi possivel salvar o convidado.', 'danger');
        }
      });
  }
}