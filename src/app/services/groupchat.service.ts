import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import { map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore/';
import { Router } from '@angular/router';

export interface User {
  uid: string;
  email: string;
}

export interface GroupChat{
  uid: string;
  groupName: string;
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
export class GroupchatService {
  constructor(private afs: AngularFirestore, private router: Router) {}

  async addChatMessage(chatId, msg, currentUserUId) {
    return await this.afs.collection(`groupchats/${chatId}/messages`).add({
      msg: msg,
      from: currentUserUId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
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


  private groupChats() {
    return this.afs
      .collection('groupchats')
      .valueChanges({ idField: 'uid' }) as Observable<GroupChat[]>;
  }

    getChatMessages(currentUserUid, chatId){
    const messages = this.afs
      .collection(`groupchats/${chatId}/messages`, (ref) => ref.orderBy('createdAt'))
      .valueChanges({ idField: 'id' }) as Observable<Message[]>;

    const users = this.getUsers();
    return combineLatest(users, messages).pipe(
      map(([users, messages]) => {
        // Get the real name for each user and decrypt each message
        for (let m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = currentUserUid === m.from;
        }
        return messages;
      })
    );
  }
 
  getGroupChats(currentUserUid) {
    const groupchats = this.afs
      .collection(`users/${currentUserUid}/groupchats`)
      .valueChanges({ idField: 'id' }) as Observable<{ id: string}[]>;
      const groupchat = this.groupChats();
      return combineLatest(groupchat, groupchats).pipe(
        map(([groupchat, groupchats]) => {
          const c: { id: string; groupName: string }[] = [];
          for (let m of groupchats) {
            c.push({ ...m, groupName: groupchat.find((u) => u.uid === m.id).groupName });
          }
          return c;
        })
      );
  }

  // öffnet den Chat Tab mit Übergabe der Datenbank ChatID
  async openGroupChat(chatId: string, groupName: string, profileId: string) {
    this.router.navigate(['/groupchat'], {
      queryParams: { cid: chatId, gName: groupName, userId: profileId },
    });
  }

  async openGroupChatSettings(chatId: string){
    this.router.navigate(['/groupchat-settings'],{
      queryParams: {cid: chatId},
    });
  }
}
