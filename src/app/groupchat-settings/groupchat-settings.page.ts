import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { doc } from "firebase/firestore";
import { DatabaseOperationsService } from '../services/database-operations.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-groupchat-settings',
  templateUrl: './groupchat-settings.page.html',
  styleUrls: ['./groupchat-settings.page.scss'],
})
export class GroupchatSettingsPage implements OnInit {

  chatId: string;
  deleteMemberInput: string;
  addMemberInput: string;
  addAdminInput: string;

  constructor(
    private router: Router,
    private firestore: Firestore,
    private dos: DatabaseOperationsService,
    private alertController: AlertController,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
        // erhält die ChatId aus der URL bei Chatinitialisierung
        this.chatId = this.route.snapshot.queryParamMap.get('cid');
  }

  async backToHome() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

  // entfernt user aus der Gruppe -> Admins können nicht entfernt werden
  async deleteUserFromGroup() {
    this.dos.searchedUser = "";
    await this.dos.adminStatusFinder(this.deleteMemberInput, this.chatId);
    await this.dos.findUserWithMail(this.deleteMemberInput);
    if(this.dos.searchedUser == "" || this.dos.admin == true){
      const alert = await this.alertController.create({
        header: 'Hinzufügen fehlgeschlagen',
        message: 'Diese Email ist nicht in der Datenbank hinterlegt oder dieser User ist Admin',
        buttons: ['OK'],
      });
      await alert.present();
    }
    else{
      // löscht sowohl die Chatverlinkung für den User als auch das Memberdokument im Gruppenchat
      await deleteDoc(doc(this.firestore, `users/${this.dos.searchedUser}/groupchats/${this.chatId}`));
      await deleteDoc(doc(this.firestore, `groupchats/${this.chatId}/groupmember/${this.dos.searchedUser}`));
      const alert = await this.alertController.create({
        header: 'Erfolgreich entfernt',
        message: 'Der User ist nicht länger Teil der Gruppe',
        buttons: ['OK'],
      });
      await alert.present();
      this.deleteMemberInput = "";
    }

  }

  //es fehlt Funktion die prüft, ob jemand schon Teil der Gruppe ist !! -> admin der bereits vorhanden ist wird wieder auf false gesetzt
  async addUserToGroup() {
    this.dos.searchedUser = "";
    await this.dos.findUserWithMail(this.addMemberInput);
    if(this.dos.searchedUser == ""){
      const alert = await this.alertController.create({
        header: 'Hinzufügen fehlgeschlagen',
        message: 'Diese Email ist nicht in der Datenbank hinterlegt',
        buttons: ['OK'],
      });
      await alert.present();
    }
    else{
      await setDoc(doc(this.firestore, `users/${this.dos.searchedUser}/groupchats/${this.chatId}`),{});
      await setDoc(doc(this.firestore, `groupchats/${this.chatId}/groupmember/${this.dos.searchedUser}`),{
        email: this.addMemberInput,
        admin: false,
      });
      const alert = await this.alertController.create({
        header: 'Erfolgreich hinzugefügt',
        message: 'Der User ist nun Teil der Gruppe',
        buttons: ['OK'],
      });
      await alert.present();
      this.addMemberInput = "";
    }

  }

  async addAdminStatus() {
    await this.dos.findUserWithMail(this.addAdminInput);
    if (this.dos.searchedUser == "") {
      const alert = await this.alertController.create({
        header: 'Hinzufügen fehlgeschlagen',
        message: 'Diese Email ist nicht in der Datenbank hinterlegt',
        buttons: ['OK'],
      });
      await alert.present();
    }
    else {
      await updateDoc(doc(this.firestore, `groupchats/${this.chatId}/groupmember/${this.dos.searchedUser}`), { admin: true });
      const alert = await this.alertController.create({
        header: 'Hinzufügen erfolgreich',
        message: 'Der User ist nun Admin',
        buttons: ['OK'],
      });
      await alert.present();
      this.addAdminInput = "";
    }
  }

}
