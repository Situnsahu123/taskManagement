import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../services/task-service';
import { Task } from '../models/task.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-management-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html'
})
export class ManagementHomeComponent implements OnInit {
  isLoading = true;
  tasks: Task[] = [];
  taskForm!: FormGroup;
  editingTask: Task | null = null;
  selectedStatus: string = '';

  

  // Pagination
  currentPage = 1;
  pageSize = 4;
  totalTasks = 0;
  totalPages = 0;

  searchQuery = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
   private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTasks();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['Pending', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  // ✅ Load tasks with pagination
loadTasks(page: number = 1): void {
  this.isLoading = true;
  this.currentPage = page;

  this.taskService
    .getMyTasks(this.currentPage, this.pageSize, this.selectedStatus)
    .subscribe({
      next: (res) => {
        this.tasks = res.tasks;
        this.totalTasks = res.totalTasks;
        this.totalPages = res.totalPages;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.isLoading = false)
    });
}


  // Pagination handler
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.loadTasks(page);
  }

  // Create task
  createTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.taskService.createTask(this.taskForm.value).subscribe({
      next: () => {
        this.loadTasks(this.currentPage);
        this.taskForm.reset({ status: 'Pending' });
      }
    });
  }

  // Edit task
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

    this.taskService.updateTask({
      ...this.editingTask,
      ...this.taskForm.value
    }).subscribe({
      next: () => {
        this.loadTasks(this.currentPage);
        this.cancelEdit();
      }
    });
  }

  deleteTask(id: string): void {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.taskService.deleteTask(id).subscribe({
      next: () => this.loadTasks(this.currentPage)
    });
  }

  trackByTaskId(index: number, task: Task) {
    return task._id ?? index;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  filterStatus(status: string) {
  this.selectedStatus = status;
  this.currentPage = 1;
  this.loadTasks(1);
}

}
