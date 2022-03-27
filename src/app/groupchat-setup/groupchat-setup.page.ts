import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfilePictureService } from '../services/profile-picture.service';
import { Firestore, addDoc, doc, setDoc} from '@angular/fire/firestore';
import { collection} from "firebase/firestore";
import { DatabaseOperationsService } from '../services/database-operations.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-groupchat-setup',
  templateUrl: './groupchat-setup.page.html',
  styleUrls: ['./groupchat-setup.page.scss'],
})
export class GroupchatSetupPage implements OnInit {

  groupMemberInput: string;
  groupMember: Array<string> = [];
  groupName: "";
  profile = null;

  constructor(
    private router: Router,
    private profilePictureService: ProfilePictureService,
    private firestore: Firestore,
    private dos: DatabaseOperationsService,
    private alertController: AlertController,

  ) {
    this.profilePictureService.getUserProfile().subscribe((data) => {
      this.profile = data;
    });
  }

  ngOnInit() {
  }


  async backToHome() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

  async deleteFromGroup(member: string) {
    for (var i = 0; i < this.groupMember.length; i++) {

      if (this.groupMember[i] === member) {

        this.groupMember.splice(i, 1);
      }

    }
  }

  // fügt Member erstmal einem Array hinzu -> Richtig hinzugefügt werden sie bei Gruppeninitialisierung "setupGroup()"
  async addToGroup() {
    this.dos.searchedUser = "";
    await this.dos.findUserWithMail(this.groupMemberInput);
    if (this.dos.searchedUser == "") {
      this.groupMemberInput = "";
      const alert = await this.alertController.create({
        header: 'Hinzufügen fehlgeschlagen',
        message: 'Diese Email ist nicht in der Datenbank hinterlegt',
        buttons: ['OK'],
      });
      await alert.present();
    }
    else {
      // wenn die email schon drin ist nimm sie raus und pack sie neu rein
      await this.deleteFromGroup(this.groupMemberInput);
      this.groupMember.push(this.groupMemberInput);
      this.groupMemberInput = "";
      this.dos.searchedUser = "";
    }
  }

  // erstellt eine neue Gruppe unter "groupchats" und fügt in jedem User Dokument eine "Verlinkung" für den Chat ein
  async setupGroup() {
    const groupChatRef = await addDoc(collection(this.firestore, "groupchats"), {
      groupName: this.groupName,
    });
    const slicedChatPath = groupChatRef.path.slice(11);
    for (let i = 0; i < this.groupMember.length; i++) {
      await this.dos.findUserWithMail(this.groupMember[i]);
      var groupMemberId = this.dos.searchedUser;
      await setDoc(doc(this.firestore, `groupchats/${slicedChatPath}/groupmember/${groupMemberId}`), {
        email: this.groupMember[i],
        admin: false,
      });
      await setDoc(doc(this.firestore, `users/${groupMemberId}/groupchats/${slicedChatPath}`), {})
    }
    await setDoc(doc(this.firestore, `users/${this.profile.id}/groupchats/${slicedChatPath}`), {
      groupName: this.groupName,
    });
    await setDoc(doc(this.firestore, `groupchats/${slicedChatPath}/groupmember/${this.profile.id}`), {
      email: this.profile.email,
      admin: true,
    });

    const alert = await this.alertController.create({
      header: 'Erfolgreich',
      message: 'Die Gruppe wurde erstellt',
      buttons: ['OK'],
    });
    await alert.present();
    this.groupMemberInput = "";
    this.groupMember = [];
    this.groupName = "";

  }

}
