import { Component, input } from '@angular/core';

@Component({
  selector: 'app-files-download',
  imports: [],
  templateUrl: './files-download.html',
})
export class FilesDownload {
  data = input.required<{
    label: string, url: string
  }[]>()

  ahmad!: string;
}
