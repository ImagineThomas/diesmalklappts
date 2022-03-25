import { Injectable } from '@angular/core';
import { deleteToken, getToken, Messaging } from '@angular/fire/messaging';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment.prod';
@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private tokenField: string = null;
  constructor(
    public messaging: Messaging,
    private toastController: ToastController
  ) {}

  get token() {
    return this.tokenField;
  }

  async getToken() {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
      });
      this.tokenField = token;
      if (await this.saveTokenToFirestore(token)) {
        const toast = await this.toastController.create({
          message: 'Successfully registered your device',
          duration: 2000,
        });
        await toast.present();
      }
      return;
    } catch (error) {
      const toast = await this.toastController.create({
        header: 'Error',
        message: error,
      });
      await toast.present();
    }
  }

  async deleteToken() {
    try {
      await deleteToken(this.messaging);
      // await this.deleteTokenFromFirestore();
      this.tokenField = null;
      const toast = await this.toastController.create({
        message: 'Successfully removed your device from messaging',
        duration: 2000,
      });
      await toast.present();
    } catch (error) {
      console.error('delete token error', error);
      const toast = await this.toastController.create({
        header: 'Error',
        message: error,
      });
      await toast.present();
    }
  }

    // receiveMessage() {
    //   return onMessage(this.messaging, async (payload) => {
    //     await this.displayReceivedMessage(payload);
    //     console.log('Message Received', payload);
        
    //   });
    // }
 // falls wir den token in der db speichern wollen unsere datenbank einfpgen
  // private async saveTokenToFirestore(token: string, isMainDevice?: boolean) {
  //   if (!token) return false;
  //   isMainDevice;
  //   const doc = getDeviceDocPath(this.accountService.uid$.value, token);
  //   if (await this.dbService.exists(doc)) {
  //     return false;
  //   }
  //   const data = {
  //     token,
  //     userAgent: navigator.userAgent,
  //   };
  //   await this.dbService.addWithDocumentReference(doc, data);
  //   return true;
  // }
 // gespeicherten token entfernen unsere Datenbank einfügen
  // private async deleteTokenFromFirestore() {
  //   try {
  //     if (!this.tokenField) return;
  //     return await this.dbService.remove(
  //       getDeviceDocPath(this.accountService.uid$.value, this.tokenField)
  //     );
  //   } catch (error) {
  //     return;
  //   }
  // }

 // anpassen an unser cryptoscheiß
  // async displayReceivedMessage(payload: MessagePayload) {
  //   const message =
    
  //     payload.notification.body;
  //   const toast = await this.toastController.create({
  //     header: payload.notification.title,
  //     icon: payload.notification.image,
  //     message,
  //     duration: 2000,
  //     position: 'top',
  //   });
  //   toast.present();
  // }
}
