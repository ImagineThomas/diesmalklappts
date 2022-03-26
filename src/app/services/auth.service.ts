import { Injectable } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { ProfilePictureService } from '../services/profile-picture.service';
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
  constructor(
    private auth: Auth,
    private profilePictureService: ProfilePictureService,
    private firestore: Firestore) {}
    profile = null;



  async register({ email, password }) {
    try {
      const user = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

     
            
      this.profilePictureService.getUserProfile().subscribe((data) => {
        this.profile = data;
      });

      const userDocRef = doc(this.firestore, `users/${user.user.uid}`);
      await setDoc(userDocRef, {
        email,
        uid: user.user.uid,
      });  


      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: "P-256",
        },
        true,
        ["deriveKey", "deriveBits"]
      );
    
      
      const publicKeyJwk = await window.crypto.subtle.exportKey(
        "jwk",
        keyPair.publicKey
      );
    
      const privateKeyJwk = await window.crypto.subtle.exportKey(
        "jwk",
        keyPair.privateKey
      );
    
        
      

        const user1DocRef = doc(this.firestore, `users/${this.profile.id}`);
        await setDoc(user1DocRef, {
          
          email,
          ["PublicKey"]: [publicKeyJwk]
        },
          { merge: true });
      
          const user2DocRef = doc(this.firestore, `prKeys/${this.profile.id}`);
          await setDoc(user2DocRef, {
            
            ["PrivateKey"]: [privateKeyJwk]
          },
            { merge: true });


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