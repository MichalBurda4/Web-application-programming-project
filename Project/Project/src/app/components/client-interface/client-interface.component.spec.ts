import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientInterfaceComponent } from './client-interface.component';

describe('ClientInterfaceComponent', () => {
  let component: ClientInterfaceComponent;
  let fixture: ComponentFixture<ClientInterfaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientInterfaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
