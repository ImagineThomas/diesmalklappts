import { Injectable } from '@angular/core';
import { collection, query, where, getDocs, getDoc, doc} from "firebase/firestore";
import { Firestore,} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseOperationsService {

  searchedUser: string = "";
  admin: boolean = false;
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

    async adminStatusFinder(userId: string, groupChatId: string){
      const docRef = doc(this.firestore, `groupchats/${groupChatId}/groupmember/${userId}`);
      const docSnap = await getDoc(docRef);
      this.admin = docSnap.data().admin;
    }
}
