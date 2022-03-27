import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { GroupchatService } from '../services/groupchat.service';
import { IonContent } from '@ionic/angular';
import { DatabaseOperationsService } from '../services/database-operations.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-groupchat',
  templateUrl: './groupchat.page.html',
  styleUrls: ['./groupchat.page.scss'],
})
export class GroupchatPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  messages: Observable<any[]>;
  newMsg = '';
  chatId: string;
  groupName: string;
  message: string;
  userId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gcs: GroupchatService,
    private dos: DatabaseOperationsService,
    private alertController: AlertController,
  ) { }

    // es fehlt noch Verschlüsselung für Groupchats !!

  ngOnInit() {
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    // erhält die ChatId aus der URL bei Chatinitialisierung
    this.chatId = this.route.snapshot.queryParamMap.get('cid');
    // erhält email des Chatpartners aus der URL bei Chatinitialisierung
    this.groupName = this.route.snapshot.queryParamMap.get('gName');
    this.messages = this.gcs.getChatMessages(this.userId, this.chatId);
  }

  sendMessage() {
    this.gcs.addChatMessage(this.chatId, this.newMsg, this.userId).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    });
  }


  async backToHome() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }

  // Admin Funktionen für den Gruppenchat -> hinzufügen, Entfernen von Mitgliedern, Admin Status vergeben
  async openGroupSettings(){
    await this.dos.adminStatusFinder(this.userId, this.chatId);
    if(this.dos.admin == true){
      this.gcs.openGroupChatSettings(this.chatId);
    }
    else{
      const alert = await this.alertController.create({
        header: 'Zugriff verweigert',
        message: 'Diese Funktion ist nur Admins zugänglich!',
        buttons: ['OK'],
      });
      await alert.present();
    }


  }

}
