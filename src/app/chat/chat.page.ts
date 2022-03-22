import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore, addDoc, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  chatID: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
  ) { }

  ngOnInit() {
    //erhält die ChatId aus der URL
    const chatId = this.route.snapshot.queryParamMap.get('id');
    const docRef = (this.firestore, `chats/${chatId}`);
  }

  async backToHome(){
    this.router.navigateByUrl('home', {replaceUrl: true});
  }

}
