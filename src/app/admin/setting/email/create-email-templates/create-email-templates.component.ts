import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { ToastrManager } from "ng6-toastr-notifications";

import { SettingService } from '../../../../admin/services/setting.service';
import { CreateEmailTemplate, TemplateTypes, UpdateEmailTemplate } from '../../../models/setting.model';


@Component({
  selector: 'app-create-email-templates',
  templateUrl: './create-email-templates.component.html',
  styles: []
})
export class CreateEmailTemplatesComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  public isLoading: boolean;
  public isApiSubmit: boolean;
  public emailTemplateId: number;
  public emailTemplatesModel: CreateEmailTemplate = {} as CreateEmailTemplate;
  public updateEmailTemplate: UpdateEmailTemplate = new UpdateEmailTemplate();
  public templateVariables: TemplateTypes[] = [];
  public templateTypes: TemplateTypes[];
  public activeTemplateVariables: any[] = [];
  private activeTemplateVariablesList: any[] = [];

  private curlyBracesMatch: any[] = [];
  convertedHtml: any;
  cursor: number = 0;

  constructor(
    private settingService: SettingService,
    private toastr: ToastrManager,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isLoading = false;
    this.isApiSubmit = false;
  }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
      this.emailTemplateId = +params["id"];
      if (this.emailTemplateId) {
        this.getParticularEmailTemplate(this.emailTemplateId);
      } else {
        this.getEmailTemplateVariables();
      }
    });

    this.getTemplateTypes();


  }

  convertInsertedEmail() {
    if (this.emailTemplatesModel.emailBody == undefined) {
      this.toastr.errorToastr('Please provide email body');
    } else {
      let convertString = this.emailTemplatesModel.emailBody.replace(/[{]{2}/gm, "<b>");
      convertString = convertString.replace(/[}]{2}/gm, "</b>");
      this.convertedHtml = convertString;
    }
  }

  private getParticularEmailTemplate(templateId: number) {

    forkJoin([
      this.settingService.getParticularEmailTemplate(templateId),
      this.settingService.getEmailTemplateVariables()]).subscribe(
        (res: any) => {
          const emailTemplateObj = res[0].body.data.emailTemplate;

          this.emailTemplatesModel.emailSubject = emailTemplateObj.emailSubject;
          this.emailTemplatesModel.emailBody = emailTemplateObj.emailBody;
          this.emailTemplatesModel.templateType = emailTemplateObj.emailTemplateType.name;
          this.activeTemplateVariables = [];
          this.activeTemplateVariablesList = [];
          if (emailTemplateObj.templateVariables.length > 0 ) {
            this.emailTemplatesModel.templateVariableIds = emailTemplateObj.templateVariables;
            this.emailTemplatesModel.templateVariableIds.forEach(obj => {
              this.activeTemplateVariables.push(obj.id);
              this.activeTemplateVariablesList.push(obj);
              const templateVariable = res[1].body.data.templateVariables.find(item => { return item.id === obj.id });
              if (templateVariable) {
                templateVariable.isActive = true;
              } else {
                templateVariable.isActive = false;
              }
              this.templateVariables = res[1].body.data.templateVariables;
            });
          } else {
            this.templateVariables = res[1].body.data.templateVariables;
          }

        },
        (err: any) => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
  }

  getCursorPosition(emailBodyTemVar: any) {
    if (emailBodyTemVar.selectionStart || emailBodyTemVar.selectionStart == '0') {
      this.cursor = emailBodyTemVar.selectionStart;
    }
  }

  private getTemplateTypes() {
    this.subscription = this.settingService.getTemplateTypes().subscribe(
      (res: any) => {
        this.templateTypes = res.body.data.templateTypes;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      },
      () => { }
    );
  }

  private getEmailTemplateVariables() {
    this.subscription = this.settingService.getEmailTemplateVariables().subscribe(
      (res: any) => {
        let templateTypes = res.body.data.templateVariables as TemplateTypes[];
        templateTypes.forEach(item => {
          item.isActive = false;
        });
        this.templateVariables = res.body.data.templateVariables;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      },
      () => { }
    );
  }

  templateVariableAdd(item: any, emailBodyTemVar: any) {
    emailBodyTemVar.value = emailBodyTemVar.value.substring(0, this.cursor)
      + `{{${item.name}}}`
      + emailBodyTemVar.value.substring(this.cursor, emailBodyTemVar.value.length);

    this.emailTemplatesModel.emailBody = emailBodyTemVar.value;
    item.isActive = !item.isActive;
    if (item.isActive) {
      this.activeTemplateVariables.push(item.id);
      this.activeTemplateVariablesList.push(item);
    } else {
      let index = this.activeTemplateVariables.indexOf(item.id);
      if (index != -1) {
        this.activeTemplateVariables.splice(index, 1);
      }
    }
    if (this.activeTemplateVariables.length > 0) {
      this.emailTemplatesModel.templateVariableIds = this.activeTemplateVariables;
    }
  }

  submitEmailTemplate(emailTemplate: NgForm) {
    if (!this.emailTemplateId) {
      if (emailTemplate.valid) {
        this.isApiSubmit = true;
        // See any {{ string }} matching on Email body and provide {{body}} output
        this.curlyBracesMatch.push(emailTemplate.value.emailBody.match(/{{\s*[\w\.]+\s*}}/g));
        if (this.activeTemplateVariablesList.length > 0 && this.curlyBracesMatch.length > 0) {
          // Get only matching name from Email body {{string}} to 'string'
          const matchingArray: any[] = emailTemplate.value.emailBody
            .match(/{{\s*[\w\.]+\s*}}/g)
            .map((item) => item.match(/[\w\.]+/)[0]);
          // Find matching values in two arrays [duplicate]
          const intersection: any[] = this.activeTemplateVariablesList
            .filter(element => matchingArray.includes(element.name));
          if (intersection.length > 0) {
            this.settingService.createEmailTemplate(this.emailTemplatesModel).subscribe(
              (res: any) => {
                this.isApiSubmit = false;
                this.toastr.successToastr(res.body.message.en);
                this.router.navigate(['/admin/setting/email']);
              },
              (err: any) => {
                this.isApiSubmit = false;
                this.toastr.errorToastr(err.error.message.en);
              },
              () => {
                this.isApiSubmit = false;
              }
            );
          } else {
            this.isApiSubmit = false;
            this.toastr.errorToastr('Please provide at least one of the template variables');
          }
        } else {
          this.settingService.createEmailTemplate(this.emailTemplatesModel).subscribe(
            (res: any) => {
              this.isApiSubmit = false;
              this.toastr.successToastr(res.body.message.en);
              this.router.navigate(['/admin/setting/email']);

            },
            (err: any) => {
              this.isApiSubmit = false;
              this.toastr.errorToastr(err.error.message.en);
            },
            () => {
              this.isApiSubmit = false;
            }
          );
        }
      } else {
        this.isApiSubmit = false;
        this.toastr.errorToastr('Email Template is not valid!');
      }
    } else {
      if (emailTemplate.valid) {
        this.isApiSubmit = true;
        // See any {{ string }} matching on Email body and provide {{body}} output
        this.curlyBracesMatch.push(emailTemplate.value.emailBody.match(/{{\s*[\w\.]+\s*}}/g));
        if (this.activeTemplateVariablesList.length > 0 && this.curlyBracesMatch.length > 0) {
          // Get only matching name from Email body {{string}} to 'string'
          const matchingArray: any[] = emailTemplate.value.emailBody
            .match(/{{\s*[\w\.]+\s*}}/g)
            .map((item) => item.match(/[\w\.]+/)[0]);
          // Find matching values in two arrays [duplicate]
          const intersection: any[] = this.activeTemplateVariablesList
            .filter(element => matchingArray.includes(element.name));
          if (intersection.length > 0) {
            this.updateEmailTemplate.templateVariableIds = this.activeTemplateVariables;
            this.updateEmailTemplate.emailBody = this.emailTemplatesModel.emailBody;
            this.updateEmailTemplate.emailSubject = this.emailTemplatesModel.emailSubject;

            this.settingService.updateEmailTemplate(this.updateEmailTemplate, this.emailTemplateId).subscribe(
              (res: any) => {
                this.isApiSubmit = false;
                this.toastr.successToastr(res.body.message.en);
                this.router.navigate(['/admin/setting/email']);
              },
              (err: any) => {
                this.isApiSubmit = false;
                this.toastr.errorToastr(err.error.message.en);
              },
              () => {
                this.isApiSubmit = false;
              }
            );
          } else {
            this.isApiSubmit = false;
            this.toastr.errorToastr('Please provide at least one of the template variables');
          }
        } else {
          this.updateEmailTemplate.emailBody = this.emailTemplatesModel.emailBody;
          this.updateEmailTemplate.emailSubject = this.emailTemplatesModel.emailSubject;

          this.settingService.updateEmailTemplate(this.updateEmailTemplate, this.emailTemplateId).subscribe(
            (res: any) => {
              this.isApiSubmit = false;
              this.toastr.successToastr(res.body.message.en);
              this.router.navigate(['/admin/setting/email']);

            },
            (err: any) => {
              this.isApiSubmit = false;
              this.toastr.errorToastr(err.error.message.en);
            },
            () => {
              this.isApiSubmit = false;
            }
          );
        }
      } else {
        this.isApiSubmit = false;
        this.toastr.errorToastr('Email Template is not valid!');
      }
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
