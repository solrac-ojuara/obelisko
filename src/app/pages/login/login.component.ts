import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  rememberMe: boolean = false;
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Se já está autenticado, redirecionar para dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Por favor, preencha todos os campos.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.email, this.password)
  .then(() => {
    this.isLoading = false;
    this.router.navigate(['/dashboard']);
  })
  .catch(() => {
    this.isLoading = false;
    this.error = 'Erro ao realizar login. Tente novamente.';
  });
  }
}
