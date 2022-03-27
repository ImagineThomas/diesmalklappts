import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroupchatSettingsPageRoutingModule } from './groupchat-settings-routing.module';

import { GroupchatSettingsPage } from './groupchat-settings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroupchatSettingsPageRoutingModule
  ],
  declarations: [GroupchatSettingsPage]
})
export class GroupchatSettingsPageModule {}
