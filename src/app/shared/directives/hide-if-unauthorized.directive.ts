import { Directive, ElementRef, OnInit, Input } from '@angular/core';
import { AuthorizationService } from '../services/authorization.service';

@Directive({
  selector: '[appHideIfUnauthorized]'
})
export class HideIfUnauthorizedDirective implements OnInit {

  @Input('appHideIfUnauthorized') permission: string;
  @Input() actionRoot: string;

  constructor(private el: ElementRef, private authorizationService: AuthorizationService) { }

  ngOnInit() {
    let permission = !this.authorizationService.hasPermission(this.permission, this.actionRoot);
    if (permission) {
      this.el.nativeElement.style.display = 'none';
      this.el.nativeElement.style.height = 0;
      this.el.nativeElement.style.width = 0;
    }
  }
}
