import { Injectable } from '@angular/core';
import { Firestore, getDoc, doc} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CryptoserviceService {

  constructor(
    private firestore: Firestore,

  ) { }

  privateKeyFromDB;
  publicKeyFromDB;

  async getPrKeyAndPuKeyFromDBAndCreateDerivedKey1(chatRecepient:string, currentUserID: string ) {
    const keyDocRef = await doc(this.firestore, `prKeys/${currentUserID}`)
    const docSnap= await getDoc(keyDocRef)
      this.privateKeyFromDB = docSnap.data().PrivateKey[0]
      
    const keyDocRef2 = await doc(this.firestore, "users/" + currentUserID + "/chats/" + chatRecepient)
    const docSnap2= await getDoc(keyDocRef2)
      this.publicKeyFromDB = docSnap2.data().publicKeyRecipient
      
    const publicKey = await window.crypto.subtle.importKey(
      "jwk",
     await this.publicKeyFromDB,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      []
    );
  
    const privateKey = await window.crypto.subtle.importKey(
      "jwk",
      await this.privateKeyFromDB,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey", "deriveBits"]
    );
  
    const derivedKey = await window.crypto.subtle.deriveKey(
      { name: "ECDH", public: publicKey },
      await privateKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    
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
      
      return decryptedChatMsg
    } catch (e) {
      console.log( `error decrypting message: ${e}`);
    }
  }

  
}
