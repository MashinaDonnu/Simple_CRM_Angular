import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AnalyticsService} from "../shared/services/analytics.service";
import {OverviewPage} from "../shared/interfaces";
import {Observable} from "rxjs";
import {MaterialInstance, MaterialService} from "../shared/classes/material.service";

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.scss']
})
export class OverviewPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('tapTarget') tapTargetRef: ElementRef
  data$: Observable<OverviewPage>
  tapTarget: MaterialInstance
  yesterday: Date = new Date()

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.data$ = this.analyticsService.getOverview()
    this.yesterday.setDate(this.yesterday.getDate() - 1)
  }

  ngOnDestroy(): void {
    this.tapTarget.destroy()
  }

  ngAfterViewInit(): void {
    this.tapTarget = MaterialService.initTapTarget(this.tapTargetRef)
  }

  openInfo() {
    this.tapTarget.open()
  }
}
