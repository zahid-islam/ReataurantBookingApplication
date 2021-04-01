import { Component, OnInit , OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrManager } from "ng6-toastr-notifications";

import { SettingService } from '../../../../admin/services/setting.service';
import { EmailTemplate } from '../../../../admin/models/setting.model';
@Component({
  selector: 'app-email-templates-list',
  templateUrl: './email-templates-list.component.html',
  styles: []
})
export class EmailTemplatesListComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public isLoading: boolean;
  public allEmailTemplates: EmailTemplate[];

  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  constructor(
    private settingService: SettingService,
    private router: Router,
    private toastr: ToastrManager,
  ) {
    this.isLoading = false;
  }

  ngOnInit() {
    this.getEmailTemplates(this.offset.toString(), this.limit.toString());
  }

  private getEmailTemplates(offset: string, limit: string) {
    this.isLoading = true;
    this.subscription = this.settingService.getEmailTemplates(offset, limit).subscribe(
      (res: any) => {
        this.allEmailTemplates = res.body.data.emailTemplates;
        this.totalCount = res.body.data.count;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      });
  }

  updateEmailTemplate(templateId: number) {
    this.router.navigate([`/admin/setting/email-template/${templateId}`]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
