import { Injectable } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from '@angular/fire/auth';
 
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth,
    private firestore: Firestore) {}
 
  async register({ email, password }) {
    try {
      const user = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const userDocRef = doc(this.firestore, `users/${user.user.uid}`);
      await setDoc(userDocRef, {
        email,
      });
      return user;
    } catch (e) {
      return null;
    }
  }
 
  async login({ email, password }) {
    try {
      const user = await signInWithEmailAndPassword(this.auth, email, password);
      return user;
    } catch (e) {
      return null;
    }
  }
 
  logout() {
    return signOut(this.auth);
  }
}