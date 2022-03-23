import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Auth } from '@angular/fire/auth';
import { ProfilePictureService } from '../services/profile-picture.service';
import { collection, query, where, getDocs } from "firebase/firestore";
import { Firestore, getDoc, addDoc, doc, setDoc } from '@angular/fire/firestore';
import { ChatPageModule } from '../chat/chat.module';

@Injectable({
  providedIn: 'root'
})
export class CryptoserviceService {

  constructor(
    private profilePictureService: ProfilePictureService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private firestore: Firestore,
    private auth: Auth,
  ) { }


  privateKeyFromDB;
  publicKeyFromDB;
  
  derivedKeyFromPrKey2;
  profile = null;

  async getPrKeyAndPuKeyFromDBAndCreateDerivedKey1(chatRecepient:string ) {
    
    const q1 = query(collection(this.firestore,  `PrKeys/${this.profile.id}`));
    const querySnapshot3 = await getDocs(q1);
    querySnapshot3.forEach((doc) => {
      this.privateKeyFromDB = doc.data().PrivateKey[0]; 
      console.log(this.privateKeyFromDB);
    })

   // const qs3 = query(collection(this.firestore,  `PrKeys/${searchedUser}`));
    const q2 = query(collection(this.firestore,  `users/${chatRecepient}`));
    const querySnapshot4 = await getDocs(q2);
    querySnapshot4.forEach((doc) => {
      this.publicKeyFromDB = doc.data().PublicKey[0]; 
      console.log(this.publicKeyFromDB);
    })


    const publicKey = await window.crypto.subtle.importKey(
      "jwk",
      this.publicKeyFromDB,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      []
    );
  
    const privateKey = await window.crypto.subtle.importKey(
      "jwk",
      this.privateKeyFromDB,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey", "deriveBits"]
    );
  
    const derivedKey = await window.crypto.subtle.deriveKey(
      { name: "ECDH", public: publicKey },
      privateKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    console.log(derivedKey)


     return derivedKey

    

  }

  async encryptWithDerKey1(chatMsg: string, derivedKey){
    //this.stringo = "PepegaDerKey1"
    const encodedText = new TextEncoder().encode(chatMsg);

    const encryptedData = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: new TextEncoder().encode("Initialization Vector") },
      derivedKey,
      encodedText
    );
  
    const uintArray = new Uint8Array(encryptedData);
  
    const string = String.fromCharCode.apply(null, uintArray);
  
    const base64Data = btoa(string);
  
    const encryptedChatMsg = base64Data;
    
    return encryptedChatMsg
    
  }


  async decryptWithDerivedKey1(encryptedChatMsg, derivedKey){
    try {
      const string = atob(encryptedChatMsg);
      const uintArray = new Uint8Array(
        [...string].map((char) => char.charCodeAt(0))
      );
      const algorithm = {
        name: "AES-GCM",
        iv: new TextEncoder().encode("Initialization Vector"),
      };
      const decryptedData = await window.crypto.subtle.decrypt(
        algorithm,
        derivedKey,
        uintArray
      );
  
      const decryptedChatMsg = new TextDecoder().decode(decryptedData);
      console.log(decryptedChatMsg)
    } catch (e) {
      console.log( `error decrypting message: ${e}`);
    }
  }

  
}
