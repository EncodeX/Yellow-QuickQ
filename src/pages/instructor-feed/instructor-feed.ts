import { Component, OnInit, OnDestroy} from '@angular/core';
import {MenuController, PopoverController, NavParams} from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { SortPopOverComponent } from '../../app/components/sortPopOver/sortPopOver';
import { PopOverSortCommService } from '../../app/services/popOverSortComm/popOverSortComm';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  selector: 'page-instructor-feed',
  templateUrl: 'instructor-feed.html'
})
export class InstructorFeedPage implements OnInit, OnDestroy {
  questions: FirebaseListObservable<any[]>;
  // question_as_object: FirebaseObjectObservable<any[]>;
  board: FirebaseObjectObservable<any>;
  page:any;

  title:string;
  bid:string;

  questions_as_array: any;
  sorted_questions_as_array: any;

  sortPopover: any;

  sortedBy:string = "TimeFIFO";
  subscription: Subscription;
  // @ViewChild(SortPopOverComponent) sortPopOverChild: SortPopOverComponent;

  constructor(public db: AngularFireDatabase, public popoverCtrl: PopoverController, private navParams: NavParams,
    private popOverSortCommService: PopOverSortCommService, private menuCtrl: MenuController ) {                   // Inject database
    
    this.page = navParams.get("page");
    this.extractNavData(this.page);

    // The URL you want to fetch data from
    this.questions = db.list('/Questions');
    this.questions.subscribe(questions => {
      let boardqs = _.filter(questions, (question)=> question.BID===this.bid )
      this.questions_as_array = boardqs;
      this.sorted_questions_as_array = this.getSortedCards();
    });
    this.board = db.object('/Boards/'+this.bid);
  }

  ngOnInit():void{
    this.subscription = this.popOverSortCommService.sortMech$.subscribe(
      item => {
        if(item){
          this.sortedBy=item;
          this.sorted_questions_as_array = this.getSortedCards();
        }
      });
  }

  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }

  extractNavData(page){
    this.title = page.title;
    this.bid = page.bid;
  }


  displaySortPopover(myEvent) {
    this.sortPopover = this.popoverCtrl.create(SortPopOverComponent, {
      sortMechanism: this.sortedBy,
    });
    this.sortPopover.onDidDismiss((data:{pop:boolean}) => {
      // console.log("ON DID DISMISS, ", data)
      this.sortPopover=null;
    });
    this.sortPopover.onWillDismiss((data:any) => {
      // console.log("ON WILL DISMISS, ", data)
      this.sortPopover=null;
    })
    this.sortPopover.present({ev: myEvent, sortMechanism: this.sortedBy})
    // .then(() => {
    //   this.popOverSortCommService.sortMech$.subscribe(
    //     response => {
    //       if(response){
    //         this.sortedBy=response;
    //         this.sorted_questions_as_array = this.getSortedCards();
    //         this.sortPopover.dismissAll();
    //       }
    //     }, error => {
    //       this.sortPopover.dismissAll();
    //     });
    // });
  }

  getSortedCards(){
    let sortMech = this.sortedBy;
    return this.sortCards(this.questions_as_array, sortMech);
  }

  sortCards(cards, sortMech){
    let sorted = null;
    switch(sortMech){
      case('Upvotes'):
        sorted = _.sortBy(cards, "Upvotes").reverse();
        return sorted;
      case('TimeFIFO'):
        sorted = _.sortBy(cards, "Timestamp");
        return sorted;
      case('TimeLIFO'):
        sorted = _.sortBy(cards, "Timestamp").reverse();
        return sorted;
      case('Resolved'):
        let [resolved, unresolved] = _.partition(cards, function(q){
          return q.isResolved
        });
        sorted = _.concat(this.sortCards(unresolved, 'TimeFIFO'), this.sortCards(resolved, 'TimeFIFO'));
        // console.log("sorted is: ", sorted);
        return sorted;
    }
  }

  resetDatabase(){
    _.map(this.questions_as_array, q=>{
      var str = '/Questions/' + q.$key;
      const _question = this.db.object(str);
      _question.update({isResolved : false});
    })
  }

  openMenu(){
    this.menuCtrl.open();
  }

}


