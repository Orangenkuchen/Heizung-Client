import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueOverviewComponent } from './value-overview.component';

describe('ValueOverviewComponent', () => {
  let component: ValueOverviewComponent;
  let fixture: ComponentFixture<ValueOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ValueOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValueOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
