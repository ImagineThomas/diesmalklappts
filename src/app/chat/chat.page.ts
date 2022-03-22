import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  chatID: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {

  }

  async backToHome(){
    this.router.navigateByUrl('home', {replaceUrl: true});
  }

}
