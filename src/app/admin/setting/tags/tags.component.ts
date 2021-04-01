import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrManager } from "ng6-toastr-notifications";
import { forkJoin, of } from "rxjs";

import { SettingService } from '../../services/setting.service';
import { TagsList, CreateTags, TagStatus, UpdateTagStatus } from '../../models/setting.model';
import { SharedDataService } from '../../../shared/services/shared-data.service';

declare var jQuery: any;

export interface TagStatusId {
  tagStatusId: number;
}


@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styles: []
})
export class TagsComponent implements OnInit, OnDestroy {
  @ViewChild('CreateTagsModal', { static: false }) CreateTagsModal: ElementRef;
  private subscription: Subscription;
  public isLoading: boolean;
  public isApiSubmit: boolean;
  public allTags: TagsList[];
  public tagId: number;
  public tagsModel: CreateTags = new CreateTags();
  public allTagStatus: TagStatus[];
  private updateTagStatus: UpdateTagStatus = new UpdateTagStatus();

  fileData: File = null;
  imagePath: any;
  imgURL: any = null;

  offset: number = 0;
  totalCount: number;
  itemPerPage: number = 10;
  limit: number = 10;
  pageLink: number = 5;

  constructor(
    private settingService: SettingService,
    private toastr: ToastrManager,
    private sharedService: SharedDataService,
  ) {
    this.isLoading = false;
    this.isApiSubmit = false;

  }

  ngOnInit() {
    this.getAllTags(this.offset.toString(), this.limit.toString());
    this.getAllTagStatuses();
  }

  private getAllTags(offset: string, limit: string, loading?: boolean) {
    this.isLoading = loading == false ? loading : true;
    this.subscription = this.settingService.getAllTags(offset, limit).subscribe(
      (res: any) => {
        this.allTags = res.body.data.tags;
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

  private getAllTagStatuses() {
    this.subscription = this.settingService.getAllTagStatuses().subscribe(
      (res: any) => {
        this.allTagStatus = res.body.data.tagStatuses;
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
      },
      () => { }
    );
  }

  public updateParticularTag(tagsId: number) {
    if (tagsId) {
      this.settingService.getParticularTag(tagsId).subscribe(
        (res: any) => {
          let tags = res.body.data.tag;
          this.tagId = tags.id;
          this.tagsModel.name = tags.name;
          this.tagsModel.image = tags.image;
          jQuery(this.CreateTagsModal.nativeElement).modal('show');
        },
        (err: any) => {
          this.toastr.errorToastr(err.error.message.en);
        }
      );
    }
  }

  createTagModalOpen() {
    this.tagId = null;
    this.tagsModel = new CreateTags();
    jQuery(this.CreateTagsModal.nativeElement).modal('show');
  }

  public fileProcess(photo: any) {
    this.fileData = <File>photo.files[0];
    let reader = new FileReader();
    this.imagePath = <File>photo.files;
    reader.readAsDataURL(this.fileData);
    reader.onload = (_event) => {
      this.imgURL = reader.result ? reader.result : null;
    };
  }

  updateTags() {
    this.settingService.updateTag(this.tagsModel, this.tagId).subscribe(
      (res: any) => {
        this.commonSuccessPortion(res);
      },
      err => {
        this.toastr.errorToastr(err.error.message.en);
        this.isApiSubmit = false;
      },
      () => {
        this.finalBlockOfAPICall();
      }
    );
  }

  createTag() {
    this.settingService.createNewTag(this.tagsModel).subscribe(
      (res: any) => {
        this.commonSuccessPortion(res);
      },
      err => {
        this.isApiSubmit = false;
        this.toastr.errorToastr(err.error.message.en);
      },
      () => {
        this.finalBlockOfAPICall();
      }
    );
  }

  finalBlockOfAPICall() {
    this.isApiSubmit = false;
    this.tagId = null;
    this.imgURL = null;
  }

  commonSuccessPortion(res: any) {
    this.toastr.successToastr(res.body.message.en);
    this.getAllTags(this.offset.toString(), this.limit.toString());
    jQuery(this.CreateTagsModal.nativeElement).modal('hide');
  }

  createOrUpdateNewTag(tag: NgForm) {
    const formData = new FormData();
    if (this.fileData) {
      formData.append('files', this.fileData);
    }
    this.isApiSubmit = true;
    forkJoin([
      this.fileData
        ? this.sharedService.uploadMultipleImages(formData)
        : of(null)
    ]).subscribe((res: any) => {
      const imageFile = res[0];
      this.tagsModel.image = imageFile ? imageFile.body.data.results[0].Location :
        this.tagsModel.image ? this.tagsModel.image : null;
      this.tagsModel.name = tag.value.name;
      if (this.tagId) {
        this.updateTags();
      }
      else {
        this.createTag();
      }
    },
      err => {
        this.isApiSubmit = false;
        this.toastr.errorToastr("Image upload failed");
      }
    );
  }

  statusChangesAction(statusId, tags: TagsList) {
    let tagStatus = this.allTagStatus.find(item => {
      return item.id === parseInt(statusId);
    }).name;

    if (tagStatus) {
      this.updateTagStatus.tagStatus = tagStatus;
      this.settingService
        .updateTagsEntity(this.updateTagStatus, tags.id)
        .subscribe(
          (res: any) => {
            tags.tagStatus.name = tagStatus;
            this.toastr.successToastr(res.body.message.en);
          },
          err => {
            tags.tagStatus.name = tags.tagStatus.name;
            this.toastr.errorToastr(err.error.message.en);
          }
        );
    }
  }

  paginate(event) {
    this.offset = event.first;
    this.limit = event.rows;
    this.getAllTags(this.offset.toString(), this.limit.toString(), false);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
