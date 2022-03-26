import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { IonContent } from '@ionic/angular';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { CryptoserviceService } from '../services/cryptoservice.service';

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
  chatRecipient: string;
  derivedKey;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private chatService: ChatService,
    private cryptoserviceService: CryptoserviceService
  ) {}

  async ngOnInit(): Promise<any> {
    this.userId = this.route.snapshot.queryParamMap.get('userId');
    // erhält die ChatId aus der URL bei Chatinitialisierung
    this.chatId = this.route.snapshot.queryParamMap.get('id');
    // erhält email des Chatpartners aus der URL bei Chatinitialisierung
    this.email = this.route.snapshot.queryParamMap.get('email');

    //UserID des gegenüber holen (DURCH DOS Funktion ersetzbar)
    const q = await query(
      collection(this.firestore, 'users'),
      where('email', '==', this.email)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.chatRecipient = doc.id;
    });
    //mit ChatID später umschreiben
    //UserID 1 und 2 einsetzen
    this.derivedKey =
      await this.cryptoserviceService.getPrKeyAndPuKeyFromDBAndCreateDerivedKey1(
        this.chatRecipient,
        this.userId
      );

    this.messages = await this.chatService.getChatMessages(
      this.userId,
      this.chatId,
      this.derivedKey
    );
  }

  async sendMessage() {
    //(DURCH DOS Funktion ersetzbar)
    const q = query(
      collection(this.firestore, 'users'),
      where('email', '==', this.email)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.chatRecipient = doc.id;
    });

    this.chatService
      .addChatMessage(this.chatId, this.newMsg, this.userId, this.chatRecipient)
      .then(() => {
        this.newMsg = '';
        this.content.scrollToBottom();
      });
  }

  async backToHome() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }
}