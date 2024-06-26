import { Component, inject, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ContactListItemComponent } from './contact-list-item/contact-list-item.component';
import { Contact } from '../../../models/contact';
import { User } from '../../../models/user';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { PersonBadgeComponent } from '../../templates/person-badge/person-badge.component';
import { EmailComponent } from './email/email.component';
import { AddContactComponent } from './add-contact/add-contact.component';
import { HeadlineSloganComponent } from '../../templates/headline-slogan/headline-slogan.component';
import { CommonModule } from '@angular/common';
import { ArrowBackBtnComponent } from '../../templates/arrow-back-btn/arrow-back-btn.component';
import { Subscription } from 'rxjs';


/**
 * This component displays the contacts of the active user.
 * By default, the contacts comprise all other users without their email address (which is dismissed for privacy reasons).
 * Individual contacts can be added by the user. Email adresses and phone numbers can be added to all contacts.
 */
@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ContactListItemComponent, PersonBadgeComponent, EmailComponent, AddContactComponent, HeadlineSloganComponent, ArrowBackBtnComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private usersSub = new Subscription();
  users: User[] = [];
  currentUser: User = new User('', '');
  sortedContacts: Contact[] = [];
  selection: number = -1;
  contactOverlay: 'add' | 'edit' | null = null;
  @ViewChild('viewer') contactViewerRef!: ElementRef;
  contactViewerResponsive: 'desktop' | 'mobile' = 'desktop';
  showEditMenuResponsive: boolean = false;


  /**
   * Initialize currently active user and full users array.
   */
  ngOnInit(): void {
    const uid = this.authService.getCurrentUid();
    if (uid) {
      this.currentUser = this.usersService.getUserByUid(uid);
      this.initUsers();
    }
  }


  /**
   * Unsubscribe
   */
  ngOnDestroy(): void {
    this.usersSub.unsubscribe();
  }


  /**
   * Call "setUsers()" method and subscribe to users (to call the same method again)
   */
  initUsers() {
    this.setUsers();
    this.usersSub = this.subUsers()
  }


  /**
   * Update users array according to usersService and update sorted contacts afterwards.
   */
  setUsers() {
    this.users = this.usersService.users;
    this.sortedContacts = this.getSortedContacts();
  }


  /**
   * Subscribe to "usersService.users$"
   * @returns subscription
   */
  subUsers(): Subscription {
    return this.usersService.users$.subscribe(() => this.setUsers());
  }


  /**
   * Responsive style settings with instant timeout as a workaround
   */
  ngAfterViewInit(): void {
    setTimeout(() => { this.setContactViewerResponsive() }, 0);
  }


  /**
   * Set "contactViewerResponsive" property according to the contact viewer width in pixels.
   * Since the width of a specific HTML element is being checked here, this cannot be achieved using a CSS media query.
   * Hence, this typescript solution is being used.
   */
  setContactViewerResponsive() {
    const width = this.contactViewerRef.nativeElement.offsetWidth;
    this.contactViewerResponsive = (width >= 698 ? 'desktop' : 'mobile');
  }


  /**
   * Set "contactViewerResponsive" property after window resizing
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setContactViewerResponsive();
  }


  /**
   * Get an array containing both individual contacts and users transformed to contacts
   * @returns contacts array
   */
  getContactsWithUsers(): Contact[] {
    const contacts: Contact[] = this.currentUser.contacts;
    this.users.forEach(u => {
      if (!this.currentUser.hasUserInContacts(u)) {contacts.push(u.asContact())}
    });
    return contacts;
  }


  /**
   * Get alphabetically sorted contacts including both individual contacts and users transformed to contacts
   * @returns sorted contacts array
   */
  getSortedContacts(): Contact[] {
    return this.getContactsWithUsers().sort((a: Contact, b: Contact) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
  }


  /**
   * Get the first letter of a contact name from a contact
   * @param contact contact
   * @returns first letter (upper case)
   */
  getFirstLetter(contact: Contact): string {
    return contact.name.charAt(0).toUpperCase();
  }


  /**
   * Check whether a certain contact name's first letter is different from the previous contact name's first letter
   * @param index alphabetically sorted contacts array index
   * @returns check result
   */
  hasNextLetter(index: number) {
    if (index > 0) {
      const current = this.getFirstLetter(this.sortedContacts[index]);
      const previous = this.getFirstLetter(this.sortedContacts[index - 1]);
      if (current == previous) { return false; }
    }
    return true;
  }


  /**
   * Set "selection" property to contact index.
   * Unset property (value: -1) in case a selected contact is clicked a second time.
   * @param index alphabetically sorted contacts array index
   */
  selectContact(index: number) {
    this.selection = (this.selection == index ? -1 : index);
  }


  /**
   * Unset "selection" propoerty and close responsive contact editing buttons menu
   */
  unselectContact() {
    this.selection = -1;
    this.toggleEditMenuResponsive(false);
  }


  /**
   * Show "add contact" overlay by setting the "contactOverlay" property to the desired form mode
   * @param mode form mode
   */
  showContactOverlay(mode: 'add' | 'edit') {
    this.contactOverlay = mode;
  }


  /**
   * Submit "add contact" form according to form mode ("add"/"edit")
   * @param contact "add contact" form data
   */
  submitContact(contact: Contact) {
    this.contactOverlay == 'add' ? this.currentUser.addContact(contact) : this.sortedContacts[this.selection] = contact;
    this.updateContacts();
    this.cancelOverlay();
  }


  /**
   * Update contacts in user Firestore data and update sorted contacts array afterwards
   */
  updateContacts() {
    this.usersService.updateUser(this.currentUser);
    this.sortedContacts = this.getSortedContacts();
  }


  /**
   * Cancel "add contact" overlay by unsetting the form mode
   */
  cancelOverlay() {
    this.contactOverlay = null;
  }


  /**
   * Delete selected/viewed contact.
   * This option should be disabled if the contact is a user.
   */
  deleteSelectedContact() {
    this.currentUser.contacts.splice(this.selection, 1);
    this.usersService.updateUser(this.currentUser);
    this.unselectContact();
  }


  /**
   * Toggle responsive contact editing buttons menu display
   * @param show desired display setting
   */
  toggleEditMenuResponsive(show?: boolean) {
    this.showEditMenuResponsive = ((show == true || show == false) ? show : !this.showEditMenuResponsive);
  }
}