import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../shared/services/auth.service";
import {Subscription} from "rxjs";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MaterialService} from "../shared/classes/material.service";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {

  form: FormGroup
  aSub: Subscription

  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    })

    this.route.queryParams.subscribe((params: Params) => {
      if (params['registered']) {
        // Успех. Теперь можно войти
        MaterialService.toast('Успех. Теперь можно войти')
      } else if (params['accessDenied']) {
        // Введите данные для входа в систему
        MaterialService.toast('Введите данные для входа в систему')
      } else if (params['sessionFailed']) {
        MaterialService.toast('Пожалуйста, войдите в систему заново.')
      }
    })
  }

  ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe()
    }
  }

  onSubmit() {
    this.form.disable()

    const user = {
      email: this.form.value.email,
      password: this.form.value.password
    }

    this.aSub = this.auth.login(user).subscribe(
      () => {
        this.router.navigate(['/overview'])
        // console.log('Login success')
        MaterialService.toast('Login success')
      },
      error => {
        MaterialService.toast(error.error.message)
        this.form.enable()
      }
    )
  }

}
