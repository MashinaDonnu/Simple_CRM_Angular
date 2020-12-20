import {Injectable} from "@angular/core";
import {OrderPosition, Position} from "../shared/interfaces";

@Injectable()
export class OrderService {

  public list: OrderPosition[] = []
  public price = 0

  add(position) {
    const orderPosition: OrderPosition = Object.assign({}, {
      name: position.name,
      cost: position.cost,
      quantity: position.quantity,
      _id: position._id
    })

    const idx = this.list.findIndex(p => p._id === orderPosition._id)
    if (idx !== -1) {
      this.list[idx].quantity += orderPosition.quantity
    } else {
      this.list.push(orderPosition)
    }

    this.computePrice()
  }

  remove(element) {
    this.list = this.list.filter(item => item._id !== element._id)
    this.computePrice()
  }

  clear() {
    this.list = []
    this.price = 0
  }

  private computePrice() {
    this.price = this.list.reduce((total, item) => {
      return total += (item.cost * item.quantity)
    }, 0)
  }
}
