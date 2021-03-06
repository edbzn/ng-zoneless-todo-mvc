import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { RxState } from '@rx-angular/state';
import { Todo } from './todo-state';

@Component({
  selector: 'app-todo',
  template: `
    <article
      class="todo"
      [class]="{ completed: todo.done, editing: isEditing }"
      *rxLet="isEditing$; let isEditing"
    >
      <div class="view" *ngIf="!isEditing">
        <input
          #toggle
          class="toggle"
          type="checkbox"
          [checked]="todo.done"
          (input)="toggleDone()"
        />
        <label (dblclick)="edit()">{{ todo.text }}</label>
        <button class="destroy" (click)="destroy()"></button>
      </div>
      <input
        #input
        class="edit"
        *ngIf="isEditing"
        [value]="todo.text"
        (blur)="updateText()"
        (keyup)="onEnter($event)"
      />
    </article>
  `,
  providers: [RxState],
})
export class TodoComponent {
  @ViewChild('input', { static: false }) input: ElementRef<HTMLInputElement>;
  @ViewChild('toggle', { static: false }) toggle: ElementRef<HTMLInputElement>;

  @Input() readonly todo: Todo;

  @Output() done = new EventEmitter<{ id: number; done: boolean }>();
  @Output() textUpdate = new EventEmitter<{ id: number; text: string }>();
  @Output() remove = new EventEmitter<{ id: number }>();

  readonly isEditing$ = this.state.select('isEditing');

  constructor(private readonly state: RxState<{ isEditing: boolean }>) {
    this.state.set({ isEditing: false });
  }

  toggleDone(): void {
    this.done.emit({
      id: this.todo.id,
      done: this.toggle.nativeElement.checked,
    });
  }

  edit(): void {
    this.state.set({ isEditing: true });
    setTimeout(() => {
      this.input.nativeElement.focus();
    });
  }

  destroy(): void {
    this.remove.emit(this.todo);
  }

  updateText(): void {
    const { value } = this.input.nativeElement;
    this.textUpdate.emit({ id: this.todo.id, text: value });
    this.state.set({ isEditing: false });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.keyCode === 13) {
      this.updateText();
    }
  }
}
