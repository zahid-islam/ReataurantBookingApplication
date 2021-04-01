import { Directive, ElementRef, OnInit, Input } from '@angular/core';
import { AuthorizationService } from '../services/authorization.service';

@Directive({
  selector: '[appDisableIfUnauthorized]'
})
export class DisableIfUnauthorizedDirective implements OnInit {

  @Input('appDisableIfUnauthorized') permission: string;
  @Input('actionRoot') actionRoot: string;

  constructor(private el: ElementRef, private authorizationService: AuthorizationService) { }

  ngOnInit() {
    if (!this.authorizationService.hasPermission(this.permission, this.actionRoot)) {
      this.el.nativeElement.disabled = true;
    }
  }

}
