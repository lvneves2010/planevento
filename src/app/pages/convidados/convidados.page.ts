import { Component, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ConvidadosService } from '../../services/convidados.service';
import { EventosService } from '../../services/eventos.service';
import { ConvidadoGet } from '../../models/convidado-get.model';
import { EventoGet } from '../../models/evento-get.model';

@Component({
  selector: 'app-convidados',
  templateUrl: './convidados.page.html',
  styleUrls: ['./convidados.page.scss'],
  standalone: false
})
export class ConvidadosPage {
  private convidadosService = inject(ConvidadosService);
  private eventosService = inject(EventosService);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  convidados: ConvidadoGet[] = [];
  evento?: EventoGet;
  carregando = false;

  private async exibirToast(mensagem: string, cor: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      color: cor,
      position: 'bottom'
    });
    await toast.present();
  }


  ionViewWillEnter() {
    this.carregarConvidados();
  }

  carregarConvidados() {
    this.carregando = true;

    this.eventosService.getEventoAtivo().subscribe({
      next: evento => {
        if (!evento) {
          this.carregando = false;
          return;
        }

        this.evento = evento;

        this.convidadosService
          .getConvidadosPorEvento(evento.id)
          .subscribe({
            next: convidados => {
              this.convidados = convidados;
              this.carregando = false;
            },
            error: err => {
              console.error('Erro ao carregar convidados', err);
              this.carregando = false;
            }
          });
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  textoConfirmacao(valor: boolean | null): string {
    if (valor === true) return 'Confirmado';
    if (valor === false) return 'Não vai';
    return 'Pendente';
  }

  statusColor(convidado: ConvidadoGet): string {
    if (convidado.confirmacaoPresenca === true) return 'success';
    if (convidado.confirmacaoPresenca === false) return 'danger';
    return 'medium';
  }

  private atualizarConvidado(convidado: ConvidadoGet, sucesso = 'Convidado atualizado.') {
    const payload = {
      nome: convidado.nome.trim(),
      email: (convidado.email || '').trim(),
      confirmacaoPresenca: convidado.confirmacaoPresenca ?? null,
      quantidadeAcompanhantes: Number(convidado.quantidadeAcompanhantes) || 0,
      observacoes: (convidado.observacoes || '').trim()
    };

    
  this.convidadosService
    .atualizarConvidado(this.evento!.id, convidado.id, payload)
    .subscribe
    ({
      next: async () => {
        await this.exibirToast(sucesso, 'success');
      },
      error: async err => {
        console.error('Erro ao atualizar convidado', err);
        await this.exibirToast('Erro ao atualizar convidado.', 'danger');
      }
    });
  }

  async editarConvidado(convidado: ConvidadoGet) {
    const alert = await this.alertController.create({
      header: 'Editar convidado',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Nome',
          value: convidado.nome
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email',
          value: convidado.email || ''
        },
        {
          name: 'quantidadeAcompanhantes',
          type: 'number',
          placeholder: 'Acompanhantes',
          value: String(convidado.quantidadeAcompanhantes || 0),
          min: 0
        },
        {
          name: 'observacoes',
          type: 'textarea',
          placeholder: 'Observacoes',
          value: convidado.observacoes || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: data => {
            const nome = (data.nome || '').trim();
            if (!nome) {
              this.exibirToast('Nome e obrigatorio.', 'danger');
              return false;
            }

            convidado.nome = nome;
            convidado.email = (data.email || '').trim();
            convidado.quantidadeAcompanhantes = Math.max(
              0,
              Number(data.quantidadeAcompanhantes) || 0
            );
            convidado.observacoes = (data.observacoes || '').trim() || undefined;
            this.atualizarConvidado(convidado, 'Convidado editado com sucesso.');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async editarConfirmacao(convidado: ConvidadoGet) {
    const alert = await this.alertController.create({
      header: 'Status de confirmacao',
      inputs: [
        {
          type: 'radio',
          label: 'Pendente',
          value: null,
          checked: convidado.confirmacaoPresenca === null
        },
        {
          type: 'radio',
          label: 'Confirmado',
          value: true,
          checked: convidado.confirmacaoPresenca === true
        },
        {
          type: 'radio',
          label: 'Nao vai',
          value: false,
          checked: convidado.confirmacaoPresenca === false
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: valor => {
            convidado.confirmacaoPresenca = valor;
            this.atualizarConvidado(convidado, 'Confirmacao atualizada.');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  alterarAcompanhantes(convidado: ConvidadoGet, delta: number) {
    const atual = Number(convidado.quantidadeAcompanhantes) || 0;
    convidado.quantidadeAcompanhantes = Math.max(0, atual + delta);
    this.atualizarConvidado(convidado, 'Acompanhantes atualizados.');
  }

  deletar(id: string) {
    if (!this.evento) return;

    this.convidadosService
      .deletarConvidado(this.evento.id, id)
      .subscribe({
        next: async () => {
          this.convidados = this.convidados.filter(c => c.id !== id);
          await this.exibirToast('Convidado removido.', 'success');
        },
        error: async err => {
          console.error('Erro ao deletar convidado', err);
          await this.exibirToast('Erro ao remover convidado.', 'danger');
        }
      });
  }
}
