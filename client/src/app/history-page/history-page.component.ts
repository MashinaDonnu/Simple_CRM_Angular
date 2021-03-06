import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MaterialInstance, MaterialService} from "../shared/classes/material.service";
import {OrdersService} from "../shared/services/orders.service";
import {Subscription} from "rxjs";
import {Filter, Order} from "../shared/interfaces";

const STEP = 2

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.scss']
})
export class HistoryPageComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('tooltip') tooltipRef: ElementRef
  tooltip: MaterialInstance
  oSub: Subscription
  isFilterVisible = false
  orders: Order[] = []
  filter: Filter = {}

  offset = 0
  limit = STEP

  reloading = false
  loading = false
  isNoMoreOrders = false

  constructor(private ordersService: OrdersService) { }

  ngOnInit(): void {
    this.reloading = true
    this.fetch()
  }

  ngOnDestroy(): void {
    this.tooltip.destroy()
    if (this.oSub) {
      this.oSub.unsubscribe()
    }
  }

  ngAfterViewInit(): void {
    this.tooltip = MaterialService.initTooltip(this.tooltipRef)
  }

  fetch() {
    // const params = {offset: this.offset, limit: this.limit}
    const params = Object.assign({}, this.filter, {offset: this.offset, limit: this.limit})
    this.oSub = this.ordersService.fetch(params).subscribe(orders => {
      this.isNoMoreOrders = orders.length < STEP
      this.orders = this.orders.concat(orders)
      this.loading = false
      this.reloading = false
    })
  }

  loadMore() {
    this.offset += STEP
    this.fetch()
    this.loading = true
  }

  applyFilter(filter: Filter) {
    this.orders = []
    this.offset = 0
    this.filter = {...filter}
    this.reloading = true
    this.fetch()
  }

  isFiltered(): boolean {
    return Object.keys(this.filter).length !== 0
  }
}
