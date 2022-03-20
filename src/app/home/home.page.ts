import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Auth } from '@angular/fire/auth';
import { ProfilePictureService } from '../services/profile-picture.service';
import { collection, query, where, getDocs } from "firebase/firestore";
import {Firestore, addDoc, doc, setDoc} from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  profile = null;
  email: string = 'email';
  searchedUser: string ='';
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
      // gleicht die eingegebene Email mit der Datenbank ab und vergibt, wenn gefunden der Email eine ID
  async findUserWithMail() {
    const q = query(collection(this.firestore, "users"), where("email", "==", this.email));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      this.searchedUser = doc.id;
    });
  }
      
  async generateChatWithUser(){
    await this.findUserWithMail();
    const chatUser1 = await addDoc(collection(this.firestore, "chats"), {
      user1: this.searchedUser,
      user2: this.profile.id,
    });
    const userDocRef = doc(this.firestore, `users/${this.profile.id}`);
    await setDoc(userDocRef, {
      chat1: [chatUser1, 12]
    },
    {merge: true});
    const chatUser2 = await addDoc(collection(this.firestore, "chats"),{
      bla: 1,
    });
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
