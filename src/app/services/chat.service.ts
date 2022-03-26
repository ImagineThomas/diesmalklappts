import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { AngularFirestore} from '@angular/fire/compat/firestore/';
import { Router } from '@angular/router';
import { CryptoserviceService } from '../services/cryptoservice.service';
import { doc, docData, Firestore, setDoc, getDoc } from '@angular/fire/firestore';
import { collection, query, where, getDocs} from "firebase/firestore";



export interface User {
  uid: string;
  email: string;
}

export interface Message {
  createdAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private afs: AngularFirestore, private router: Router,
    private cryptoserviceService: CryptoserviceService, 
    ) { }


  async addChatMessage(chatId, msg, currentUserUId, chatRecepient) {
    
  const d = await this.cryptoserviceService.getPrKeyAndPuKeyFromDBAndCreateDerivedKey1(chatRecepient, currentUserUId )
  console.log(d)
    msg = await this.cryptoserviceService.encryptWithDerKey1(msg, d)
    return await this.afs.collection(`chats/${chatId}/messages`).add({
      "msg": msg,
      from: currentUserUId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }



   async getChatMessages(currentUserUid, chatId, derivedKey): Promise<any> {

    const messages = this.afs
      .collection(`chats/${chatId}/messages`, (ref) => ref.orderBy('createdAt'))
      .valueChanges({ idField: 'id' }) as Observable<Message[]>;

   
    const users = this.getUsers();
    return combineLatest(users, messages).pipe(
      map(([users,messages])=> {
        // Get the real name for each user and decrypt each message
        for (let m of messages) {
          this.cryptoserviceService.decryptWithDerivedKey1(m.msg, derivedKey).then(res => {m.msg = res})
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = currentUserUid === m.from;       
        }
        return  messages 
      })   
    );    
  }

  // sucht alle Kontakte, die im CurrentUser hinterlegt sind ( Kontakt bedeutet hier nur = Chat mit dieser Person existiert)
  getChats(currentUserUid) {
    const chats = this.afs
      .collection(`users/${currentUserUid}/contacts`)
      .valueChanges({ idField: 'id' }) as Observable<{ id: string }[]>;
    const users = this.getUsers();
    return combineLatest(users, chats).pipe(
      map(([users, chats]) => {
        const c: { id: string, email: string }[] = []
        for (let m of chats) {
          c.push({ ...m, email: users.find(u => u.uid === m.id).email })
        }
        return c;
      })
    );
  }


  private getUsers() {
    return this.afs
      .collection('users')
      .valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }


  private getUserForMsg(msgFromId, users: User[]): string {
    for (let usr of users) {
      if (usr.uid == msgFromId) {
        return usr.email;
      }
    }
    return 'Deleted';
  }


  // öffnet den Chat Tab mit Übergabe der Datenbank ChatID
  async openChat(chatID: string, searchedUserEmail: string, profileID: string) {
    this.router.navigate(['/chat'], {
      queryParams: { id: chatID, email: searchedUserEmail, userId: profileID},
    });
  }
}
