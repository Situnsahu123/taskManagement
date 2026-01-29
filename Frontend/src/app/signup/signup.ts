import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule,RouterModule,ReactiveFormsModule],
  templateUrl: './signup.html'
})
export class SignupComponent implements OnInit {

  signupForm!: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      password: ['', Validators.required,Validators.minLength(6),Validators.maxLength(16)]
    });
  }

  submit() {
    if (this.signupForm.invalid) return;

    this.auth.signup(this.signupForm.value as any).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.error = err.error.message || 'Signup failed';
      }
    });
  }
}
