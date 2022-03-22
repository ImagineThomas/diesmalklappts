import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore, doc, setDoc} from '@angular/fire/firestore';
import { ProfilePictureService } from '../services/profile-picture.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  chatId: string;
  profile = null;
  message: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private profilePictureService: ProfilePictureService,
  ) { 
    this.profilePictureService.getUserProfile().subscribe((data) => {
    this.profile = data;
    });
  }

  ngOnInit() {
    //erhält die ChatId aus der URL bei Chatinitialisierung
    this.chatId = this.route.snapshot.queryParamMap.get('id');
  }

  async backToHome(){
    this.router.navigateByUrl('home', {replaceUrl: true});
  }

  async sendMessage(){
    //der timestamp isn bissl strange aber scheint zu funktionieren/ reicht zum ordnen der Nachrichten -> Nachrichten werden eh immer unten hinzugefügt -> nicht neu geordnet
    //falls man die Zeit cooler angeben will -> andere Funktion nutzen 
    const current = new Date();
    const timestamp = current.getTime();
    const chatDocRef = doc(this.firestore, `chats/${this.chatId}`);
    await setDoc(chatDocRef, {
      [timestamp]: this.profile.id + ":" + this.message
    },
      { merge: true });
    // clear Message Input HTLM Field
    this.message = "";

  }

}
