import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { ProfilePictureService } from '../services/profile-picture.service';
import { CryptoserviceService } from '../services/cryptoservice.service';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  DocumentReference,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { docData } from 'rxfire/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { stringify } from 'querystring';
import { time } from 'console';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  chatId: string;
  email: string;
  profile = null;
  message: string;
  chatContainer: string[] = [];
  chatTestContainer: String[] = [];
  testo;

  chat$: Observable<[string, string][]> = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private profilePictureService: ProfilePictureService
  ) {
    this.profilePictureService.getUserProfile().subscribe((data) => {
      this.profile = data;
    });
  }

  ngOnInit() {
    // erhält die ChatId aus der URL bei Chatinitialisierung
    this.chatId = this.route.snapshot.queryParamMap.get('id'); //problem wenn 2 mit gleichem user schreiben
    // erhält email des Chatpartners aus der URL bei Chatinitialisierung
    this.email = this.route.snapshot.queryParamMap.get('email');

    const d = docData( //docData erzeugt observable
      doc(this.firestore, 'chats/' + this.chatId) as DocumentReference<{ //wir holen doc und kriegen docureference
        chatContainer: string[]; //wie ist der Typ auf der Datenbank
      }>
    ).pipe(
      map((doc) => {
        const Msg: [string, string][] = [];
        doc.chatContainer.forEach((m) => {
          const [user, text] = m.split(':');
          Msg.push([user, text]);
        });
        return Msg;
      })
    );
    this.chat$ = d;
    this.chat$.subscribe((x) => console.log(x));
    
  }

  async backToHome() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }





  async fillChatContainerFromDB() {
    const docRef = doc(this.firestore, `chats/${this.chatId}`);
    const docSnap = await getDoc(docRef);
    setDoc(docRef, { chatContainer: this.chatContainer }, { merge: true });
    console.log(this.chatContainer);

  }



  async sendMessage() {
    // der timestamp isn bissl strange aber scheint zu funktionieren/ reicht zum ordnen der Nachrichten -> Nachrichten werden eh immer unten hinzugefügt -> nicht neu geordnet
    // falls man die Zeit cooler angeben will -> andere Funktion nutzen
    const current = new Date();
    const timestamp = current.getTime();
 
    const chatDocRef = doc(this.firestore, `chats/${this.chatId}`);
    await setDoc(
      chatDocRef,
      {

      [timestamp]: this.profile.id + ':' + this.message,
      ["chatContainer"]: [this.profile.id + ':' + this.message]

      },
      { merge: true }
    );
    // clear Message Input HTLM Field
    this.message = '';
  }
}
