import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private API = 'http://localhost:4000/api/tasks';

  constructor(private http: HttpClient) {}

  

getMyTasks(
  page: number = 1,
  limit: number = 4,
  status?: string
): Observable<any> {
  const token = localStorage.getItem('token')!;

  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  if (status) {
    params = params.set('status', status);
  }

  return this.http.get<any>(this.API, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
}



  /** Search tasks by username with pagination */
getTaskByName(
  name: string,
  page: number = 1,
  limit: number = 4,
  sortBy: string = '',
  suggest: boolean = false
): Observable<any> {

  const token = localStorage.getItem('token')!;

  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString())
    .set('sortBy', sortBy)
    .set('suggest', suggest.toString());

  return this.http.post<any>(
    `${this.API}/byusername`,
    { name },
    {
      headers: { Authorization: `Bearer ${token}` },
      params
    }
  );
}



  /** Create task */
  createTask(task: Task): Observable<Task> {
    const token = localStorage.getItem('token')!;
    return this.http.post<Task>(this.API, task, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /** Get single task */
  getTaskById(id: string): Observable<Task> {
    const token = localStorage.getItem('token')!;
    return this.http.get<Task>(`${this.API}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /** Update task */
  updateTask(task: Task): Observable<Task> {
    const token = localStorage.getItem('token')!;
    return this.http.put<Task>(`${this.API}/${task._id}`, task, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  /** Delete task */
  deleteTask(id: string): Observable<any> {
    if (!id) throw new Error('Task ID is required to delete a task');
    const token = localStorage.getItem('token')!;
    return this.http.delete(`${this.API}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  
}
