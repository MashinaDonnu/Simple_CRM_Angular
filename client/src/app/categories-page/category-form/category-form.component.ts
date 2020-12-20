import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {switchMap} from "rxjs/operators";
import {of} from "rxjs";
import {CategoriesService} from "../../shared/services/categories.service";
import {Category, Message} from "../../shared/interfaces";
import {MaterialService} from "../../shared/classes/material.service";

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent implements OnInit {

  @ViewChild('input') fileInput: ElementRef
  img: File
  form: FormGroup
  imagePreview:any = ''
  isNew = true
  category: Category

  constructor(private route: ActivatedRoute, private categoriesService: CategoriesService, private router: Router) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required)
    })

    // this.route.params.subscribe((params: Params) => {
    //   if (params['id']) {
    //     // Edit category
    //     this.isNew = false
    //   }
    // })

    this.form.disable()

    this.route.params.pipe(
      switchMap(
        (params: Params) => {
          if (params['id']) {
            this.isNew = false
            return this.categoriesService.getById(params['id'])
          }
          return of(null)
        }
      )
    ).subscribe(
      (category: Category) => {
        if (category) {
          this.category = category
          this.form.patchValue({
            name: category.name
          })
          this.imagePreview = category.imageSrc
          MaterialService.updateTextFields()
        }
        this.form.enable()
      },
      error => {
        MaterialService.toast(error.error.message)
      }
    )
  }

  triggerClick() {
    this.fileInput.nativeElement.click()
  }

  onFileUpload(event: any) {
    const file = event.target.files[0]

    this.img = file
    const reader = new FileReader()
    console.log('Reader: ', reader)
    reader.onload = () => {
      this.imagePreview = reader.result
    }

    reader.readAsDataURL(file)
  }

  onSubmit() {
    let obs$
    this.form.disable()
    if (this.isNew) {
      obs$ = this.categoriesService.create(this.form.value.name, this.img)
    } else {
      obs$ = this.categoriesService.update(this.category._id, this.form.value.name, this.img)
    }

    obs$.subscribe(
      (category: Category) => {
        const msg = this.isNew ? 'Категория добавлена.' : 'Категория обновлена'
        MaterialService.toast(msg)
        this.category = category
        this.form.enable()
      },
      error => {
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    )
  }

  removeCategory() {
    const decision = window.confirm(`Удалить категорию "${this.category.name}"?`)
    if (decision) {
      this.categoriesService.remove(this.category._id)
        .subscribe(
          (response: Message) => MaterialService.toast(response.message),
          error => MaterialService.toast(error.error.message),
          () => this.router.navigate(['/categories']),
        )
    }
  }
}
