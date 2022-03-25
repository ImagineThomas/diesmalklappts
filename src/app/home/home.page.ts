import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Auth } from '@angular/fire/auth';
import { ProfilePictureService } from '../services/profile-picture.service';
import { collection, query, where, getDocs} from "firebase/firestore";
import { Firestore, addDoc, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { ChatService } from '../services/chat.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  profile = null;
  email: string;
  searchedUser: string = '';
  chatIdForUrl: string;
  chatExists: boolean;
  chats: Observable<{ id: string, email: string }[]>;
  constructor(
    private profilePictureService: ProfilePictureService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private firestore: Firestore,
    private auth: Auth,
    private chatServices: ChatService,

  ) {

    this.profilePictureService.getUserProfile().subscribe((data) => {
      this.profile = data;
      this.chats = chatServices.getChats(data.id)
    });
  }
  // loggt den User aus
  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }


  // Funktion zum ermitteln der Uid eines Users anhand einer email
  async findUserWithMail(searchedEmail: string) {
    const q = query(collection(this.firestore, "users"), where("email", "==", searchedEmail));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.searchedUser = doc.id;
    });
  }

  // Funktion zum prüfen, ob ein Chat zwischen User und Recipient schon existiert
  async checkForExistingChatWithUser(user: string, recipient: string) {
    const docRef = doc(this.firestore, `users/${user}/chats/${recipient}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.chatIdForUrl = docSnap.data().chatId;
      this.chatExists = true;

    } else {
      this.chatExists = false;
    }

  }

  // füllt die Kontaktliste mit Chats mit den ich kommunizieren will, email mitgeben
  async fillContactlist(sender: string, reciever: string) {
    const docRef = doc(this.firestore, `users/${sender}/contacts/${reciever}`);
    setDoc(docRef, { id: reciever });
  }

  // generiert chat mit einem anderen User oder öffnet ihn nur falls schon vorhanden
  async generateChatWithUser() {
    // ermitteln der Uid der eigegebenen Mail
    await this.findUserWithMail(this.email);
    // prüfen, ob ein Chat mit dem gesuchten User schon existiert
    await this.checkForExistingChatWithUser(this.profile.id, this.searchedUser);
    if (this.chatExists == false) {
      const chatUser = await addDoc(collection(this.firestore, "chats"), {
      });
      //umformen von der Reference zu einem ChatID String da man damit besser arbeiten kann
      var chatPath = chatUser.path;
      var slicedChatPath = chatPath.slice(6);
      await setDoc(doc(this.firestore, `users/${this.profile.id}/chats/${this.searchedUser}`), {
        chatId: slicedChatPath,
        recipientId: this.searchedUser,
        publicKeyRecipient: "PublicKey2",
      });
      await setDoc(doc(this.firestore, `users/${this.searchedUser}/chats/${this.profile.id}`), {
        chatId: slicedChatPath,
        publicKeyRecipient: "PublicKey1",
      });
      this.fillContactlist(this.searchedUser, this.profile.id);
      this.fillContactlist(this.profile.id, this.searchedUser);
      this.chatServices.openChat(slicedChatPath, this.email, this.profile.id);
    }
    else {
      this.chatServices.openChat(this.chatIdForUrl, this.email, this.profile.id);

    }
  }

  async openChat(recipientId: string, recipient: string){
    await this.checkForExistingChatWithUser(this.profile.id, recipientId);
    this.chatServices.openChat(this.chatIdForUrl, recipient, this.profile.id);
  }


  async openGroupchatSetupPage(){
    this.router.navigate(['/groupchat-setup']);
  }

  // gibt dem User die Möglichkeit ein Profilbild zu machen
  async changeImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos, // Camera, Photos or Prompt!
    });

    if (image) {
      const loading = await this.loadingController.create();
      await loading.present();

      const result = await this.profilePictureService.uploadImage(image);
      loading.dismiss();

      if (!result) {
        const alert = await this.alertController.create({
          header: 'Upload failed',
          message: 'There was a problem uploading your avatar.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }
}
