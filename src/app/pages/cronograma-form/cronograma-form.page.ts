import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EventosService } from '../../services/eventos.service';
import { TarefasService } from '../../services/tarefas.service';
import { EventoGet } from '../../models/evento-get.model';

@Component({
  selector: 'app-cronograma-form',
  templateUrl: './cronograma-form.page.html',
  styleUrls: ['./cronograma-form.page.scss'],
  standalone: false
})
export class CronogramaFormPage {
  private eventosService = inject(EventosService);
  private tarefasService = inject(TarefasService);
  private router = inject(Router);

  evento?: EventoGet;
  carregando = false;

  form = {
    descricao: '',
    dataLimite: ''
  };

  constructor() {
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
    if (!this.evento) return;

    this.carregando = true;

    const payload = {
      descricao: this.form.descricao.trim(),
      dataLimite: this.form.dataLimite
    };

    this.tarefasService
      .criarTarefa(this.evento.id, payload)
      .subscribe({
        next: () => {
          this.carregando = false;
          this.router.navigateByUrl('/cronograma');
        },
        error: err => {
          console.error('Erro ao criar tarefa', err);
          this.carregando = false;
        }
      });
  }

}