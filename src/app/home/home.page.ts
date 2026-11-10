import { Component, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { EventosService } from '../services/eventos.service';
import { ConvidadosService } from '../services/convidados.service';
import { TarefasService } from '../services/tarefas.service';
import { FinanceiroService } from '../services/financeiro.service';

import { EventoGet } from '../models/evento-get.model';
import { StatusTarefa } from '../models/tarefa-get.model';

/** Números de um evento para o dashboard. */
interface ResumoEvento {
  evento: EventoGet;
  convidados: number;
  convidadosComAcompanhantes: number;
  confirmados: number;
  confirmadosComAcompanhantes: number;
  tarefasPendentes: number;
  tarefasEmAndamento: number;
  tarefasConcluidas: number;
  totalPrevisto: number;
  totalPago: number;
}

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Dashboard com todos os eventos. O selecionado aparece aberto, com os
 * atalhos para as abas; os outros aparecem resumidos, e tocar num deles o
 * seleciona (as abas passam a mostrar os dados dele).
 */
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
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  resumos: ResumoEvento[] = [];
  idSelecionado?: string;
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

    forkJoin({
      eventos: this.eventosService.listarEventos(),
      ativo: this.eventosService.getEventoAtivo()
    })
      .pipe(
        switchMap(({ eventos, ativo }) => {
          this.idSelecionado = ativo?.id;
          return eventos.length ? forkJoin(eventos.map(e => this.resumir(e))) : of([]);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: resumos => {
          this.resumos = resumos;
          this.carregando = false;
        },
        error: err => {
          console.error('Erro ao carregar dashboard', err);
          this.carregando = false;
        }
      });
  }

  get selecionado(): ResumoEvento | undefined {
    return this.resumos.find(r => r.evento.id === this.idSelecionado);
  }

  get outros(): ResumoEvento[] {
    return this.resumos.filter(r => r.evento.id !== this.idSelecionado);
  }

  selecionar(resumo: ResumoEvento) {
    this.eventosService.selecionarEvento(resumo.evento.id).subscribe(() => {
      this.idSelecionado = resumo.evento.id;
    });
  }

  novoEvento() {
    this.router.navigateByUrl('/evento/novo');
  }

  moeda(valor: number): string {
    return formatoMoeda.format(valor || 0);
  }

  private resumir(evento: EventoGet): Observable<ResumoEvento> {
    return forkJoin({
      convidados: this.convidadosService.getConvidadosPorEvento(evento.id),
      tarefas: this.tarefasService.getTarefasPorEvento(evento.id),
      itens: this.financeiroService.getItensPorEvento(evento.id)
    }).pipe(
      map(({ convidados, tarefas, itens }) => {
        const pessoas = (c: { quantidadeAcompanhantes?: number }) => 1 + (c.quantidadeAcompanhantes || 0);
        const confirmados = convidados.filter(c => c.confirmacaoPresenca === true);
        return {
          evento,
          convidados: convidados.length,
          convidadosComAcompanhantes: convidados.reduce((t, c) => t + pessoas(c), 0),
          confirmados: confirmados.length,
          confirmadosComAcompanhantes: confirmados.reduce((t, c) => t + pessoas(c), 0),
          tarefasPendentes: tarefas.filter(t => t.status === StatusTarefa.Pendente).length,
          tarefasEmAndamento: tarefas.filter(t => t.status === StatusTarefa.EmAndamento).length,
          tarefasConcluidas: tarefas.filter(t => t.status === StatusTarefa.Concluida).length,
          totalPrevisto: itens.reduce((t, i) => t + (i.valorPrevisto || 0), 0),
          totalPago: itens.reduce((t, i) => t + (i.valorPago || 0), 0)
        };
      })
    );
  }
}
