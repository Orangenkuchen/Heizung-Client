import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunTimeComponent } from './run-time.component';

describe('RunTimeComponent', () => {
  let component: RunTimeComponent;
  let fixture: ComponentFixture<RunTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunTimeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RunTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
