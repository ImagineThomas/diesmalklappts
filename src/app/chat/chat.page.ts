import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore, doc, setDoc} from '@angular/fire/firestore';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  chatId: string;
  message: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
  ) { }

  ngOnInit() {
    //erhält die ChatId aus der URL
    this.chatId = this.route.snapshot.queryParamMap.get('id');
  }

  async backToHome(){
    this.router.navigateByUrl('home', {replaceUrl: true});
  }

  async sendMessage(){
    const current = new Date();
    const timestamp = current.getTime();
    const chatDocRef = doc(this.firestore, `chats/${this.chatId}`);
    await setDoc(chatDocRef, {
      [timestamp]: this.message
    },
      { merge: true });

  }

}
