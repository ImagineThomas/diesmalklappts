import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroupchatSetupPageRoutingModule } from './groupchat-setup-routing.module';

import { GroupchatSetupPage } from './groupchat-setup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroupchatSetupPageRoutingModule
  ],
  declarations: [GroupchatSetupPage]
})
export class GroupchatSetupPageModule {}
