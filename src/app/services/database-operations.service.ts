import { Injectable } from '@angular/core';
import { collection, query, where, getDocs} from "firebase/firestore";
import { Firestore, addDoc, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseOperationsService {

  searchedUser: string = "";
  constructor(
    private firestore: Firestore,
  ) { }


    // Funktion zum ermitteln der Uid eines Users anhand einer email
    async findUserWithMail(searchedEmail: string) {
      const q = query(collection(this.firestore, "users"), where("email", "==", searchedEmail));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        this.searchedUser = doc.id;
      });
    }
}
