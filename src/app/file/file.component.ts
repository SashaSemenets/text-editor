import { Component, OnInit, Renderer2} from '@angular/core';
import { TextService } from '../text-service/text.service';
import { Subscription } from 'rxjs';
import { TextSelectEvent } from '../text-select.directive';

interface SelectionRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.css']
})
export class FileComponent implements OnInit {
  text = '';
  selectedObject: any;
  query = '';
  subscription: Subscription;
  event: any;
  public hostRectangle: SelectionRectangle | null;
  private selectedText: string;
  synonyms = null;
  viewportRectangle: any;
  showSynonymCard = false;


  constructor(private textService: TextService, private renderer: Renderer2) {
    this.getEvent();
    this.hostRectangle = null;
    this.selectedText = '';
  }

  ngOnInit() {
    this.textService.getMockText().then((result) => this.text = result);
  }

  getEvent() {
    this.subscription = this.textService.getEvent().subscribe(resp => {
      this.event = resp;
      this.checkSelectedWord();
    });
  }

  checkSelectedWord() {
    const element = document.getElementsByClassName('selected');
    element[0].classList.toggle(`${this.event}`);
  }

  public renderRectangles( event: TextSelectEvent ): void {
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    const selectedEl = document.getElementsByClassName('selected');
    if (event.text.length > 0 && selectedEl.length === 0) {
      const newNode = document.createElement('span');
      newNode.setAttribute('class', `selected`);
      range.surroundContents(newNode);
    }
    if ( event.hostRectangle ) {
        this.hostRectangle = event.hostRectangle;
        this.selectedText = event.text;
        this.viewportRectangle = event.viewportRectangle;
    }
  }

  public findSynonim(): void {
    this.textService.findSynonim(this.selectedText)
      .subscribe((resp) => {
          this.synonyms = resp;
          this.showSynonymCard = true;
    });
  }

  changeWord(newWord: string) {
    const element = document.getElementsByClassName('selected');
    element[0].innerHTML = newWord;
    this.textService.updateText(this.text);
    this.synonyms = null;
    this.showSynonymCard = false;
    this.viewportRectangle = null;
    this.hostRectangle = null;
    this.selectedText = '';
    element[0].classList.remove('selected');
  }
}
