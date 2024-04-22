import { Component } from '@angular/core';
import { HeadlineOtherComponent } from '../../templates/headline-other/headline-other.component';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [HeadlineOtherComponent],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {

}