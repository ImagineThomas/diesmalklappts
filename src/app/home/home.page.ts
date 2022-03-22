import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Auth } from '@angular/fire/auth';
import { ProfilePictureService } from '../services/profile-picture.service';
import { collection, query, where, getDocs } from "firebase/firestore";
import { Firestore, addDoc, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  profile = null;
  email: string = 'email';
  searchedUser: string = '';
  chatExists: boolean = false;
  constructor(
    private profilePictureService: ProfilePictureService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private firestore: Firestore,
    private auth: Auth,
  ) {
    this.profilePictureService.getUserProfile().subscribe((data) => {
      this.profile = data;
    });
  }
  // loggt den User aus
  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }
  // öffnet den Chat Tab mit Übergabe der Datenbank ChatID
  async openChat(chatID: string) {
    this.router.navigate(['/chat'], {queryParams: {id:chatID}});
  }

  // gleicht die eingegebene Email mit der Datenbank ab und vergibt, wenn gefunden der Email eine ID
  async findUserWithMail() {
    const q = query(collection(this.firestore, "users"), where("email", "==", this.email));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      this.searchedUser = doc.id;
      if (doc.data().hasOwnProperty(this.profile.id) == true) {
        this.chatExists = true;
      }
      else {
        this.chatExists = false;
      }
    });
  }
  // generiert chat mit einem anderen User
  async generateChatWithUser() {
    await this.findUserWithMail();
    //Prüfung ob der Chat bereits existiert -> chatExists wird in findUserWithMail gesetzt
    if(this.chatExists == false) {
      const chatUser = await addDoc(collection(this.firestore, "chats"), {
        ersteNachricht: "bla",
      });
      //umformen von der Reference zu einem ChatID String da man damit besser arbeiten kann
      var chatPath = chatUser.path;
      var slicedChatPath = chatPath.slice(6);
      const user1DocRef = doc(this.firestore, `users/${this.profile.id}`);
      await setDoc(user1DocRef, {
        [this.searchedUser]: [slicedChatPath, this.searchedUser, "publicKeyUser2"]
      },
        { merge: true });
      const user2DocRef = doc(this.firestore, `users/${this.searchedUser}`);
      await setDoc(user2DocRef, {
        [this.profile.id]: [slicedChatPath, this.profile.id, "publicKeyUser1"]
      },
        { merge: true });
      this.openChat(slicedChatPath);
    }
    else{
      console.log(slicedChatPath);
      this.openChat(slicedChatPath);
    }
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
