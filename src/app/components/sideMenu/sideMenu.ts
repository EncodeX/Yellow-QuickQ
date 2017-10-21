import {Component, ViewChild} from '@angular/core';
import {AlertController, MenuController, Nav, NavController, NavParams} from "ionic-angular";
import {DashboardPage} from "../../../pages/dashboard/dashboard";
import {AngularFireAuth} from "angularfire2/auth";
import {SignInPage} from "../../../pages/sign-in/sign-in";
import {BoardService} from "../../services/board/board.service";

/**
 * This class represents the lazy loaded SideMenuComponent.
 */
@Component({
  selector: 'sd-side-menu',
  templateUrl: 'sideMenu.html',
  providers: [BoardService]
})
export class SideMenuComponent {
  @ViewChild(Nav) navi: Nav;

  mainRootPage = DashboardPage;
  pages: Array<{title: string, bid:string, component: any, params: {}}>;
  user: any;

  constructor(private menuCtrl: MenuController, private afAuth: AngularFireAuth, private alertCtrl: AlertController, private navParams: NavParams, private boardService: BoardService) {
    // set our app's pages
    this.user = navParams.get("user");
    console.log('sideMenu constructor. This.user is: ', this.user);
    this.boardService.initialize(this.user.uid, boards => {
      this.pages = boards;
      console.log("this.pages is: ", this.pages);
    });
  }

  toDashboard(){
    console.log("toDashboard called with this.,user is: ", this.user);
    this.menuCtrl.close();
    this.navi.setRoot(DashboardPage, {"user":this.user});
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menuCtrl.close();
    // navigate to the new page if it is not the current page
    this.navi.setRoot(page.component, {"page":page});
  }

  logout() {
    this.afAuth.auth.signOut();
    this.presentLogoutSuccessAlert();
    /**
     * Think Ionic has a bug here.
     * If we set root only once. Menu won't show
     * up after the second time we sign in.
     * At the same time, setting root twice doesn't
     * seems causing any problem.
     */
    this.navi.parent.setRoot(SignInPage);
    this.navi.parent.setRoot(SignInPage);
  }

  presentLogoutSuccessAlert() {
    const alert = this.alertCtrl.create({
      title: 'Logged Out',
      subTitle: 'You have successfully been logged out.',
      buttons: ['OK']
    });
    alert.present();
  }
}
