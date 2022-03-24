import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore} from '@angular/fire/firestore';
import { ProfilePictureService } from '../services/profile-picture.service';
import { Observable } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { IonContent } from '@ionic/angular';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
 
  messages: Observable<any[]>;
  newMsg = '';
  chatId: string;
  email: string;
  message: string;
  userId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private profilePictureService: ProfilePictureService,
    private chatService: ChatService,
  ) {
  }

  ngOnInit() {
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    // erhält die ChatId aus der URL bei Chatinitialisierung
    this.chatId = this.route.snapshot.queryParamMap.get('id'); //problem wenn 2 mit gleichem user schreiben
    // erhält email des Chatpartners aus der URL bei Chatinitialisierung
    this.email = this.route.snapshot.queryParamMap.get('email');
    this.messages = this.chatService.getChatMessages(this.userId, this.chatId);
    console.log(1);

    
  }

  sendMessage() {
    this.chatService.addChatMessage(this.chatId, this.newMsg, this.userId).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    });
  }

  async backToHome() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }


}
