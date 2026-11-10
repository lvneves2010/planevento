import { Component, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventosService } from '../services/eventos.service';
import { ConvidadosService } from '../services/convidados.service';
import { TarefasService } from '../services/tarefas.service';
import { FinanceiroService } from '../services/financeiro.service';

import { EventoGet } from '../models/evento-get.model';
import { ConvidadoGet } from '../models/convidado-get.model';
import { TarefaGet, StatusTarefa } from '../models/tarefa-get.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnDestroy {
  private eventosService = inject(EventosService);
  private convidadosService = inject(ConvidadosService);
  private tarefasService = inject(TarefasService);
  private financeiroService = inject(FinanceiroService);

  private destroy$ = new Subject<void>();

  evento?: EventoGet;

  convidados: ConvidadoGet[] = [];
  tarefas: TarefaGet[] = [];
  itensFinanceiros: any[] = [];

  carregando = false;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillEnter() {
    this.carregarDashboard();
  }

  carregarDashboard() {
    this.carregando = true;

    this.eventosService.getEventoAtivo().pipe(takeUntil(this.destroy$)).subscribe({
      next: evento => {
        if (!evento) {
          this.carregando = false;
          console.error('Nenhum evento encontrado');
          return;
        }

        this.evento = evento;

        // Carregar convidados
        this.convidadosService
          .getConvidadosPorEvento(evento.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe(c => this.convidados = c);

        // // Carregar tarefas
        this.tarefasService
          .getTarefasPorEvento(evento.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe(t => this.tarefas = t);

        // // Carregar itens financeiros
        this.financeiroService
          .getItensPorEvento(evento.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe((itens: any[]) => {
            this.itensFinanceiros = itens;
            this.carregando = false;
          });
      },
      error: err => {
        console.error('Erro ao carregar dashboard', err);
        this.carregando = false;
      }
    });
  }

  // ====== CONVIDADOS ======
  get totalConvidados(): number {
    return this.convidados.length;
  }

  get totalConvidadosComAcompanhantes(): number {
    return this.convidados.reduce(
      (total, convidado) => total + 1 + (convidado.quantidadeAcompanhantes || 0),
      0
    );
  }

  get totalConfirmados(): number {
    return this.convidados.filter(c => c.confirmacaoPresenca === true).length;
  }

  get totalConfirmadosComAcompanhantes(): number {
    return this.convidados
      .filter(c => c.confirmacaoPresenca === true)
      .reduce((total, convidado) => total + 1 + (convidado.quantidadeAcompanhantes || 0), 0);
  }

  // ====== CRONOGRAMA ======
  get tarefasPendentes(): number {
    return this.tarefas.filter(t => t.status === StatusTarefa.Pendente).length;
  }

  get tarefasEmAndamento(): number {
    return this.tarefas.filter(t => t.status === StatusTarefa.EmAndamento).length;
  }

  get tarefasConcluidas(): number {
    return this.tarefas.filter(t => t.status === StatusTarefa.Concluida).length;
  }

  // ====== FINANCEIRO ======
  get totalPrevisto(): number {
    return this.itensFinanceiros
      .reduce((total, item) => total + item.valorPrevisto, 0);
  }

  get totalPago(): number {
    return this.itensFinanceiros
      .filter(item => item.valorPago)
      .reduce((total, item) => total + item.valorPago, 0);
  }
}