import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PositionsService} from "../../../shared/services/positions.service";
import {Position} from "../../../shared/interfaces";
import {MaterialInstance, MaterialService} from "../../../shared/classes/material.service";
import {FormGroup, FormControl, Validators} from "@angular/forms";


@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.scss']
})
export class PositionsFormComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('modal') modalRef: ElementRef
  @Input('categoryId') categoryId

  positions: Position[] = []
  positionId = null
  loading = false
  modal: MaterialInstance
  form: FormGroup

  constructor(private positionsService: PositionsService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      cost: new FormControl(null, [Validators.required, Validators.min(1)])
    })

    this.loading = true
    this.positionsService.fetch(this.categoryId).subscribe(positions => {
      this.positions = positions
      this.loading = false
      console.log(this.positions)
    })
  }

  ngOnDestroy(): void {
    this.modal.destroy()
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef)
  }

  onSelectPosition(position: Position) {
    this.positionId = position._id
    this.form.patchValue({
      name: position.name,
      cost: position.cost
    })
    this.modal.open()
    MaterialService.updateTextFields()
  }

  onSubmit() {
    this.form.disable()

    const completed = () => {
      this.form.enable()
      this.form.reset()
      this.modal.close()
    }

    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId,
    }

    if (this.positionId) {
      newPosition._id = this.positionId
      this.positionsService.update(newPosition).subscribe(
        position => {
          MaterialService.toast(`Позиция "${position.name}" была обновлена.`)
          const idx = this.positions.findIndex(p => p._id === position._id)
          this.positions[idx] = position
        },
      error => {
        this.form.enable()
        MaterialService.toast(error.error.message)
      },
        completed
      )
    } else {
      this.positionsService.create(newPosition).subscribe(
        position => {
          MaterialService.toast(`Позиция "${position.name}" была добавлена.`)
          this.positions.push(position)
        },
        error => {
          this.form.enable()
          MaterialService.toast(error.error.message)
        },
        completed
      )
    }
  }

  onAddPosition() {
    this.positionId = null
    this.modal.open()
    this.form.reset()
    MaterialService.updateTextFields()
  }

  onCancel() {
    this.modal.close()
  }

  onDeletePosition(event: Event, position: Position) {
    event.stopPropagation()
    const decision = window.confirm(`Удалить позицию "${position.name}"?`)
    if (decision) {
      this.positionsService.delete(position._id).subscribe(
        response => {
          this.positions = this.positions.filter(p => p._id !== position._id)
          MaterialService.toast(response.message)
        },
        error => MaterialService.toast(error.error.message)
      )
    }
  }


}
