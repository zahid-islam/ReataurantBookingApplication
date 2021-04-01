import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
import { NgForm } from '@angular/forms';
import { ManageService } from './../../services/manage.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  passwordModel: any = {};
  password: any = {};
  @Output() closeModal = new EventEmitter();

  constructor(private manageService: ManageService, private toastr: ToastrManager) { }

  ngOnInit() {
  }

  updatePassword(passwordForm: NgForm) {
    if (passwordForm) {
      this.password.oldPassword = this.passwordModel.oldPassword;
      this.password.newPassword = this.passwordModel.newPassword;

      this.manageService.updatePassword(this.password)
        .subscribe(
          (res: any) => {
            localStorage.setItem('token', res.body.data.token)
            this.toastr.successToastr(res.body.message.en);
            this.closePasswordModal();
          },
          err => {
            this.toastr.errorToastr(err.error.message.en);
          });
    }
  }

  validateConfirmPass(passwordForm) {
    passwordForm.controls['confirmNewPassword'].updateValueAndValidity();
  }

  closePasswordModal() {
    this.closeModal.emit();
  }

}
