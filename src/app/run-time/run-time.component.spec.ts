import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunTimeComponent } from './run-time.component';

describe('RunTimeComponent', () => {
  let component: RunTimeComponent;
  let fixture: ComponentFixture<RunTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RunTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
