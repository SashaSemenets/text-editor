import { Component, OnInit } from '@angular/core';
import { TextService } from '../text-service/text.service';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent implements OnInit {
  constructor(private textService: TextService) {
  }

  ngOnInit() {
  }

  onToggle(str): void {
    this.textService.onToggle(str);
  }
}
