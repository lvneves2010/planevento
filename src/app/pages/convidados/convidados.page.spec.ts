import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConvidadosPage } from './convidados.page';

describe('ConvidadosPage', () => {
  let component: ConvidadosPage;
  let fixture: ComponentFixture<ConvidadosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvidadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
