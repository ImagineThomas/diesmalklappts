import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { GroupchatService } from '../services/groupchat.service';
import { IonContent } from '@ionic/angular';

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
  ) { }

  ngOnInit() {
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    // erhält die ChatId aus der URL bei Chatinitialisierung
    this.chatId = this.route.snapshot.queryParamMap.get('cid'); //problem wenn 2 mit gleichem user schreiben
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

}
