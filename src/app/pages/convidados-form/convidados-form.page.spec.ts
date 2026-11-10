import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConvidadosFormPage } from './convidados-form.page';

describe('ConvidadosFormPage', () => {
  let component: ConvidadosFormPage;
  let fixture: ComponentFixture<ConvidadosFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvidadosFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
