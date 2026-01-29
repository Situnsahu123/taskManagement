import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { TaskService } from '../services/task-service';
import { Task } from '../models/task.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin.html',
})
export class AdminComponent implements OnInit {

  isLoading = true;
  tasks: Task[] = [];
  taskForm!: FormGroup;
  editingTask: Task | null = null;

  searchUsername = '';
  sortBy: string = '';
  originalTasks: Task[] = [];
  selectedStatus: string = '';


  currentPage = 1;
  limit = 4;
  totalTasks = 0;
  totalPages = 0;
  hasSearched = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAllTasks();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['Pending', Validators.required],
      dueDate: ['', Validators.required],
    });
  }

  /* ================= LOAD ALL TASKS ================= */
  loadAllTasks(page: number = 1): void {
    this.isLoading = true;
    this.currentPage = page;
    this.hasSearched = false;

    this.taskService.getMyTasks(this.currentPage, this.limit, this.selectedStatus).subscribe({
      next: (res) => {
        this.tasks = res.tasks || [];
        this.totalTasks = res.totalTasks || 0;
        this.totalPages = res.totalPages || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  /* ================= SEARCH (ON TYPING) ================= */
  searchUser(page: number = 1): void {
    const value = this.searchUsername.trim();

    // ❌ Do not load all tasks while typing
    if (!value) {
      this.tasks = [];
      this.totalTasks = 0;
      this.totalPages = 0;
      this.hasSearched = false;
      return;
    }

    this.isLoading = true;
    this.hasSearched = true;
    this.currentPage = page;

    this.taskService
      .getTaskByName(value, page, this.limit, this.sortBy)
      .subscribe({
        next: (res) => {
          this.tasks = res.tasks || [];
          this.totalTasks = res.totalTasks || 0;
          this.totalPages = res.totalPages || 0;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  /* ================= SORT ================= */
  onSortChange(value: string): void {
    this.sortBy = value;
    if (this.searchUsername.trim()) {
      this.searchUser(1);
    }
  }

  /* ================= PAGINATION ================= */
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    if (this.hasSearched) {
      this.searchUser(page);
    } else {
      this.loadAllTasks(page);
    }
  }

  /* ================= CLEAR SEARCH ================= */
  clearSearch(): void {
    this.searchUsername = '';
    this.sortBy = '';
    this.currentPage = 1;
    this.hasSearched = false;
    this.loadAllTasks();
  }

  /* ================= CREATE TASK ================= */
  createTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.taskService.createTask(this.taskForm.value).subscribe({
      next: (task) => {
        this.tasks = [task, ...this.tasks];
        this.taskForm.reset({ status: 'Pending' });
      },
      error: (err) => console.error('Failed to create task', err),
    });
  }

  /* ================= EDIT / UPDATE ================= */
  editTask(task: Task): void {
    this.editingTask = task;
    this.taskForm.patchValue(task);
  }

  cancelEdit(): void {
    this.editingTask = null;
    this.taskForm.reset({ status: 'Pending' });
  }

  updateTask(): void {
    if (!this.editingTask || this.taskForm.invalid) return;

    const updatedData = this.taskForm.value;

    this.taskService
      .updateTask({ ...this.editingTask, ...updatedData })
      .subscribe({
        next: (task) => {
          this.tasks = this.tasks.map((t) =>
            t._id === task._id ? task : t
          );
          this.cancelEdit();
        },
        error: (err) => console.error('Failed to update task', err),
      });
  }

  /* ================= DELETE ================= */
  deleteTask(id: string): void {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t._id !== id);
      },
      error: (err) => console.error('Failed to delete task', err),
    });
  }

  /* ================= TRACK BY ================= */
  trackByTaskId(index: number, task: Task) {
    return task._id ?? index;
  }

  /* ================= LOGOUT ================= */
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

    filterStatus(status: string) {
  this.selectedStatus = status;
  this.currentPage = 1;
  this.loadAllTasks(1);
}
}
