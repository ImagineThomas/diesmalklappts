import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroupchatSetupPage } from './groupchat-setup.page';

const routes: Routes = [
  {
    path: '',
    component: GroupchatSetupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroupchatSetupPageRoutingModule {}
