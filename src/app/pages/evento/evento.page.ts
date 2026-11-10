import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { EventosService } from '../../services/eventos.service';
import { EventoGet } from '../../models/evento-get.model';
import { AnunciosService } from '../../services/anuncios.service';

/**
 * Cadastro do evento. Em `/evento` edita o evento selecionado (ou cria o
 * primeiro, se ainda não houver nenhum); em `/evento/novo` cria mais um.
 */
@Component({
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
  standalone: false
})
export class EventoPage {
  private eventosService = inject(EventosService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  readonly anuncios = inject(AnunciosService);

  evento?: EventoGet;
  carregando = false;
  novo = false;
  calendarioAberto = false;

  form = {
    nome: '',
    dataEvento: '',
    local: '',
    observacoes: ''
  };

  // a aba fica viva entre as navegações, então recarrega sempre ao entrar
  // (o evento selecionado pode ter mudado no dashboard)
  ionViewWillEnter() {
    this.novo = this.router.url.split('?')[0].endsWith('/evento/novo');
    this.carregarEvento();
  }

  get titulo(): string {
    return this.evento ? 'Evento' : 'Novo evento';
  }

  private toDateOnly(value?: string): string {
    if (!value) return '';
    return value.includes('T') ? value.split('T')[0] : value.substring(0, 10);
  }

  private limparForm() {
    this.evento = undefined;
    this.form = { nome: '', dataEvento: '', local: '', observacoes: '' };
  }

  carregarEvento() {
    this.limparForm();
    if (this.novo) {
      return;
    }

    this.carregando = true;

    this.eventosService.getEventoAtivo().subscribe({
      next: evento => {
        if (evento) {
          this.evento = evento;
          this.form.nome = evento.nome;
          this.form.dataEvento = this.toDateOnly(evento.dataEvento);
          this.form.local = evento.local || '';
          this.form.observacoes = evento.observacoes || '';
        }
        this.carregando = false;
      },
      error: err => {
        console.error('Erro ao carregar evento', err);
        this.carregando = false;
      }
    });
  }

  escolherData(evento: CustomEvent) {
    const valor = evento.detail.value;
    this.form.dataEvento = typeof valor === 'string' ? this.toDateOnly(valor) : '';
    this.calendarioAberto = false;
  }

  async salvar() {
    if (!this.form.nome.trim()) {
      await this.exibirToast('Informe o nome do evento.', 'danger');
      return;
    }

    this.carregando = true;

    const payload = {
      nome: this.form.nome.trim(),
      dataEvento: this.form.dataEvento,
      local: this.form.local,
      observacoes: this.form.observacoes
    };

    const requisicao$: Observable<unknown> = this.evento
      ? this.eventosService.atualizarEvento(this.evento.id, payload)
      : this.eventosService.criarEvento(payload);

    requisicao$.subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigateByUrl('/home');
      },
      error: err => {
        console.error('Erro ao salvar evento', err);
        this.carregando = false;
      }
    });
  }

  async confirmarExclusao() {
    const evento = this.evento;
    if (!evento) return;

    const alerta = await this.alertController.create({
      header: 'Excluir evento',
      message: `Excluir "${evento.nome}"? Os convidados, o cronograma e o financeiro dele também serão apagados. Não dá para desfazer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.eventosService.excluirEvento(evento.id).subscribe({
              next: async () => {
                await this.exibirToast('Evento excluído.', 'success');
                this.router.navigateByUrl('/home');
              },
              error: err => console.error('Erro ao excluir evento', err)
            });
          }
        }
      ]
    });
    await alerta.present();
  }

  private async exibirToast(mensagem: string, cor: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      color: cor,
      position: 'bottom'
    });
    await toast.present();
  }
}
