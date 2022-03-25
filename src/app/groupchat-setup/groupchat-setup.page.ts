import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { ProfilePictureService } from '../services/profile-picture.service';
import { Firestore, addDoc, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { collection, query, where, getDocs} from "firebase/firestore";

@Component({
  selector: 'app-groupchat-setup',
  templateUrl: './groupchat-setup.page.html',
  styleUrls: ['./groupchat-setup.page.scss'],
})
export class GroupchatSetupPage implements OnInit {

  groupMemberInput: string;
  groupMember: Array<string> = [];
  groupName: string;
  profile = null;

  constructor(
    private router: Router,
    private profilePictureService: ProfilePictureService,
    private firestore: Firestore,
    
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

  async addToGroup(){
    this.groupMember.push(this.groupMemberInput);
    this.groupMemberInput = "";
  }

  async deleteFromGroup(member:string){
    for( var i = 0; i < this.groupMember.length; i++){ 
    
      if ( this.groupMember[i] === member) { 
  
        this.groupMember.splice(i, 1);
      }
  
  }
  }


  async setupGroup(){
    const chatUser = await addDoc(collection(this.firestore, "groupchats"), {
      groupName: this.groupName,
    });
    for (let i = 0; i < this.groupMember.length; i++) {
      addDoc(collection(this.firestore, `groupchats/groupmember/${this.groupMember[i]}`), {
        admin: false,
      });
    }


  }

}
