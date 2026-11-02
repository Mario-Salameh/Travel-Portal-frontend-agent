import { Directive, ElementRef, inject, input } from "@angular/core";
import { AuthorizationRepository } from "../../domain/authorization";

@Directive({
    selector: '[hasRole]'
})
export class HasRoleDirective {
    allowedRoles = input<number[] | undefined>([], { alias: 'hasRole' });

    authorizationRepository = inject(AuthorizationRepository);
    el = inject(ElementRef);

    ngOnInit() {
        const userRole = this.authorizationRepository.role;
        const roles = this.allowedRoles();

        if (!roles || roles.length === 0)
            return;

        else if (!roles.includes(userRole)) {
            this.el.nativeElement.classList.add('d-none');
        }
    }
}
