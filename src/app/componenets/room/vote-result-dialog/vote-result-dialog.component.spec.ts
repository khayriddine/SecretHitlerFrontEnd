import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteResultDialogComponent } from './vote-result-dialog.component';

describe('VoteResultDialogComponent', () => {
  let component: VoteResultDialogComponent;
  let fixture: ComponentFixture<VoteResultDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteResultDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
