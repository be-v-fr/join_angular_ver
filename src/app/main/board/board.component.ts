import { Component } from '@angular/core';
import { TaskCardComponent } from './task-card/task-card.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [TaskCardComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {

}
