import { Component, ElementRef, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalData } from '../../models/modal-data';
import { Observable } from 'rxjs';

const $ = (window as any)["$"];

@Component({
    selector: 'app-edit-contact-dialog',
    templateUrl: './edit-contact-dialog.component.html',
    styleUrl: './edit-contact-dialog.component.css'
})
export class EditContactDialogComponent {
    contactForm!: FormGroup;
    submitted = false;

    @ViewChild("modal") modal?: ElementRef;
    data?: any;
    private _onAction = new EventEmitter<any>();

    constructor(private fb: FormBuilder) {
        this.contactForm = this.fb.group({
            firstName: ["", Validators.required],
            lastName: ["", [Validators.required]],
            email: ["", [Validators.required, Validators.email]],
        });
    }

    get f() { return this.contactForm?.controls; }


    open(title: string, data?: any): Observable<any> {
        this.data = { title: title };

        if (data) {
            this.contactForm.setValue({ firstName: data.firstName, lastName: data.lastName, email: data.email });
        }

        $(this.modal?.nativeElement).modal("show");
        return this._onAction.asObservable();
    }

    onSubmit() {
        this.submitted = true;
        if (this.contactForm?.valid) {
            this.closeDialog();
            this._onAction.next({ formData: this.contactForm?.value });
            this.contactForm.reset();
            this.contactForm.clearValidators();
            this.submitted = false;
        } else {
            this.contactForm?.markAllAsTouched();
        }
    }

    onCancel(): void {
        this.closeDialog();
        this._onAction.next(null);
    }

    closeDialog() {
        $(this.modal?.nativeElement).modal("hide");
    }
}
