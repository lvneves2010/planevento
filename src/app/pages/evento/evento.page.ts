import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EventosService } from '../../services/eventos.service';
import { EventoGet } from '../../models/evento-get.model';
import { AnunciosService } from '../../services/anuncios.service';

@Component({
  selector: 'app-evento',
  templateUrl: './evento.page.html',
  styleUrls: ['./evento.page.scss'],
  standalone: false
})
export class EventoPage implements OnInit {
  private eventosService = inject(EventosService);
  private router = inject(Router);
  readonly anuncios = inject(AnunciosService);

  evento?: EventoGet;
  carregando = false;

  form = {
    nome: '',
    dataEvento: '',
    local: '',
    observacoes: ''
  };

  ngOnInit() {
    this.carregarEvento();
  }

  private toDateOnly(value?: string): string {
    if (!value) return '';
    return value.includes('T') ? value.split('T')[0] : value.substring(0, 10);
  }

  carregarEvento() {
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

  salvar() {
    this.carregando = true;

    const payload = {
      nome: this.form.nome,
      dataEvento: this.form.dataEvento,
      local: this.form.local,
      observacoes: this.form.observacoes
    };

    const requisicao$ = this.evento
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
}