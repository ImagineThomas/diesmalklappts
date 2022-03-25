import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { ProfilePictureService } from '../services/profile-picture.service';

@Component({
  selector: 'app-groupchat-setup',
  templateUrl: './groupchat-setup.page.html',
  styleUrls: ['./groupchat-setup.page.scss'],
})
export class GroupchatSetupPage implements OnInit {

  groupMembers: [];
  groupName: string;
  profile = null;

  constructor(
    private router: Router,
    private profilePictureService: ProfilePictureService,
    
  ) { 
    this.profilePictureService.getUserProfile().subscribe((data) => {
      this.profile = data;
    });
  }

  ngOnInit() {
  }


  async backToHome() {
    this.router.navigateByUrl('home', { replaceUrl: true });
  }


  async setupGroup(){

  }

}
