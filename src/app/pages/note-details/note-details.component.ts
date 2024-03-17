import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Note } from 'src/app/shared/note.model';
import { NotesService } from 'src/app/shared/notes.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.component.html',
  styleUrls: ['./note-details.component.scss']
})

export class NoteDetailsComponent implements OnInit {

  note: Note;
  new: boolean;

  constructor(
    private notesService: NotesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.note = new Note();
      if (params.id) {
        this.notesService.get(params.id).subscribe((note: Note) => {
          this.note = note;
        });
        this.new = false;
      } else {
        this.new = true;
      }
    })
  }

  onSubmit(form: NgForm) {
    if (this.new) {
      this.notesService.add(form.value).subscribe((newNote) => {
        this.router.navigateByUrl('/');
      })
    } else {
      this.note.title = form.value.title;
      this.note.body = form.value.body;

      this.notesService.update(this.note).subscribe(() => {
        this.router.navigateByUrl('/');
      })
    }
  }

  cancel() {
    this.router.navigateByUrl('/');
  }
}
