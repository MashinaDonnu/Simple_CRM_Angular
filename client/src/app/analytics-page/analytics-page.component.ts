import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {AnalyticsService} from "../shared/services/analytics.service";
import {AnalyticsPage} from "../shared/interfaces";
import {Chart} from 'chart.js'
import {Subscription} from "rxjs";

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {

  @ViewChild('gain') gainRef: ElementRef
  @ViewChild('order') orderRef: ElementRef

  aSub: Subscription
  average: number
  pending = true

  constructor(private analyticsService: AnalyticsService) { }

  ngAfterViewInit(): void {
    const gainConfig: any = {
      label: 'Выручка',
      color: 'rgba(255, 199, 132)'
    }

    const orderConfig: any = {
      label: 'Заказы',
      color: 'rgba(54, 162, 235)'
    }


    this.aSub = this.analyticsService.getAnalytics().subscribe((data: AnalyticsPage) => {
      this.average = data.average
      gainConfig.labels = data.chart.map(item => item.label)
      gainConfig.data = data.chart.map(item => item.gain)

      orderConfig.labels = data.chart.map(item => item.label)
      orderConfig.data = data.chart.map(item => item.order)

      const gainCtxt = this.gainRef.nativeElement.getContext('2d')
      const orderCtxt = this.orderRef.nativeElement.getContext('2d')
      gainCtxt.canvas.height = '300px'
      orderCtxt.canvas.height = '300px'

      // new Chart(gainCtxt, createChartConfig(gainConfig))
      new Chart(orderCtxt, createChartConfig(orderConfig))

      this.pending = false
    })
  }

  ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe()
    }
  }
}

function createChartConfig({label, labels, color, data}) {
  return {
    type: 'line',
    options: {
      responsive: true
    },
    data: {
      labels,
      datasets: [
        {
          data, label,
          borderColor: color,
          steppedLine: false,
          fill: false
        }
      ]
    }
  }
}
