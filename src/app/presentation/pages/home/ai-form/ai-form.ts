import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModernTrustLoading } from '../../../components/modern-trust-loading/modern-trust-loading';
import { ChatService } from '../../../../core/services/chat.service';
interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  fileNames: string[];
  isTyping: boolean;
}

// const AI_RESPONSE = 'This message is for testing.\nTODO: Configuring the right model from BE';
// const CHAR_DELAY_MS = 30;
// const THINK_DELAY_MS = 650;

@Component({
  selector: 'app-ai-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ModernTrustLoading],
  templateUrl: './ai-form.html',
  styleUrl: './ai-form.css',
})
export class AiForm {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  private readonly cdr = inject(ChangeDetectorRef);
  readonly isLoaded = signal(false);
  private readonly chatService = inject(ChatService);
  messages: ChatMessage[] = [];
  inputText = '';
  attachedFiles: File[] = [];
  isAiTyping = false;

  readonly loadingFn: () => Promise<void> = () =>
    new Promise<void>((resolve) => setTimeout(resolve, 4000));

  readonly loadedFn: () => void = () => this.isLoaded.set(true);

  send(): void {
    const text = this.inputText.trim();
    if ((!text && this.attachedFiles.length === 0) || this.isAiTyping) return;

    this.messages.push({
      role: 'user',
      text,
      fileNames: this.attachedFiles.map((f) => f.name),
      isTyping: false,
    });
    this.inputText = '';
    this.attachedFiles = [];
    this.scrollToBottom();

    this.isAiTyping = true;
    const aiMsg: ChatMessage = { role: 'ai', text: '', fileNames: [], isTyping: true };
    this.messages.push(aiMsg);
    this.scrollToBottom();

    this.chatService.send(text).subscribe({
      next: ({ answer }) => {
        aiMsg.text = answer;
        aiMsg.isTyping = false;
        this.isAiTyping = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: () => {
        aiMsg.text = 'Sorry, I could not reach the chat service. Please try again.';
        aiMsg.isTyping = false;
        this.isAiTyping = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
    });
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  autoResize(ta: HTMLTextAreaElement): void {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
  }

  openFilePicker(): void {
    this.fileInput.nativeElement.click();
  }

  onFilesSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.attachedFiles = [...this.attachedFiles, ...Array.from(input.files)];
      input.value = '';
    }
  }

  removeFile(i: number): void {
    this.attachedFiles.splice(i, 1);
  }

  private scrollToBottom(): void {
    setTimeout(() => this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' }), 30);
  }
}
