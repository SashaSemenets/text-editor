import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class TextService {
  constructor(private http: HttpClient) {}
  private subject = new Subject<any>();
  url = 'http://api.datamuse.com/words?rel_syn=';
  text = 'A year ago I was in the audience at a gathering of designers in San Francisco. ' +
  'There were four designers on stage, and two of them worked for me. I was there to support them. ' +
  'The topic of design responsibility came up, possibly brought up by one of my designers, I honestly don’t remember the details. ' +
  'What I do remember is that at some point in the discussion I raised my hand and suggested, to this group of designers, ' +
  'that modern design problems were very complex. And we ought to need a license to solve them.';

  getMockText() {
    return new Promise<string>((resolve) => {
      resolve(this.text);
    });
  }

  onToggle(str: string) {
    this.subject.next(str);
  }

  getEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  updateText(str: string) {
    this.text = str;
  }

  findSynonim(word: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };
    return this.http.get(this.url + word, httpOptions);
  }
}
