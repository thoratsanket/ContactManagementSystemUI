import { Component, OnInit, ViewChild } from '@angular/core';
import { ContactData } from '../../models/contact-data';
import { ModalData } from '../../models/modal-data';
import { ContactService } from '../../services/contact.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { EditContactDialogComponent } from '../edit-contact-dialog/edit-contact-dialog.component';
import { ApiResponse } from '../../models/api-response';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.css'
})
export class ContactListComponent implements OnInit {

  contacts: ContactData[] = [];

  @ViewChild(ConfirmationDialogComponent) confirmation?: ConfirmationDialogComponent;
  @ViewChild(EditContactDialogComponent) contactEditor?: EditContactDialogComponent;


  constructor(private contactService: ContactService, private notification: NotificationService) {

  }

  ngOnInit() {
    this.getContacts();
  }

  private getContacts() {
    this.contactService.getAllContacts().subscribe({
      next: (result: ApiResponse) => {
        this.contacts = result.data;
      }
    });
  }

  addContact() {
    const data: ModalData = {
      title: "Create Contact"
    }

    const subscription = this.contactEditor?.open("Create Contact").subscribe({
      next: (form: any) => {
        form.formData.id = this.getMaxId();
        this.contactService.addContact(form.formData).subscribe({
          next: (response: ApiResponse) => {
            this.notification.success("Contact created successfully");
            this.contacts.push(response.data);
          }
        });
        subscription?.unsubscribe();
      }
    });
  }

  editContact(contact: ContactData) {
    const subscription = this.contactEditor?.open("Update Contact", contact).subscribe({
      next: (form: any) => {
        form.formData.id = contact.id;
        this.contactService.updateContact(contact.id, form.formData).subscribe({
          next: (response: ApiResponse) => {
            if (response.success) {
              this.notification.success("Contact updated successfully");
              const index = this.contacts.findIndex(c => c.id === contact.id);
              this.contacts.splice(index, 1, response.data);
            }
          }
        });
        subscription?.unsubscribe();
      }
    });
  }


  deleteContact(contactId: number) {
    const data: ModalData = {
      title: "Confirmation",
      content: "Are you sure, you want to delete this Contact?",
    }

    const subscription = this.confirmation?.open(data).subscribe({
      next: (yes: boolean) => {
        if (yes) {
          this.contactService.deleteContact(contactId).subscribe({
            next: (response: ApiResponse) => {
              if (response.success) {
                this.notification.success("Contact deleted successfully");
                const index = this.contacts.findIndex(c => c.id === contactId);
                this.contacts.splice(index, 1)
              }
            }
          })
        }
        subscription?.unsubscribe();
      }
    });
  }

  getMaxId() {
    let id = 0;
    if (this.contacts.length) {
      var lastContact = this.contacts[this.contacts.length - 1];
      id = lastContact?.id;
    }
    return Number(id) + 1;
  }
}
