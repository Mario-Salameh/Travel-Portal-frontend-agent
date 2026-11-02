import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  send(question: string) {
  return this.http.post<{ answer: string }>(
    'http://localhost:8000/api/chat',
    { question }
  );
}
}