import { booleanAttribute, Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Rodapé discreto com o logo da HSI ao lado do nome e da versão
 * (mesmo padrão do Marcador de Jogos). [compacto] mostra só o logo e o
 * número da versão (telas internas); completo, também o nome da empresa
 * (tela de abertura).
 */
@Component({
  selector: 'app-rodape-empresa',
  templateUrl: './rodape-empresa.component.html',
  styleUrls: ['./rodape-empresa.component.scss'],
  standalone: false
})
export class RodapeEmpresaComponent {
  @Input({ transform: booleanAttribute }) compacto = false;

  readonly versao = environment.appVersion;
}
