import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeekCardsDialogComponent } from './peek-cards-dialog.component';

describe('PeekCardsDialogComponent', () => {
  let component: PeekCardsDialogComponent;
  let fixture: ComponentFixture<PeekCardsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeekCardsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeekCardsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
