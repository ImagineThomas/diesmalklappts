import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {
  redirectUnauthorizedTo,
  redirectLoggedInTo,
  canActivate,
} from '@angular/fire/auth-guard';
 
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);
 
// es fehlt die Überprüfung, ob jemand befugt ist den Chat zu öffnen -> jede Page könnte über URL Manipulation gefunden und geöffnet werden (solange man eingeloggt ist)
// Nachrichten bei 1:1 Chats werden dann aber verschlüsselt dargestellt
// in der mobile App kein Problem

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
    ...canActivate(redirectLoggedInToHome),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },
  
  {
    path: 'groupchat-setup',
    loadChildren: () => import('./groupchat-setup/groupchat-setup.module').then( m => m.GroupchatSetupPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },

  {
    path: 'groupchat',
    loadChildren: () => import('./groupchat/groupchat.module').then( m => m.GroupchatPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },

  {
    path: 'groupchat-settings',
    loadChildren: () => import('./groupchat-settings/groupchat-settings.module').then( m => m.GroupchatSettingsPageModule),
    ...canActivate(redirectUnauthorizedToLogin),
  },

  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },





];
 
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}