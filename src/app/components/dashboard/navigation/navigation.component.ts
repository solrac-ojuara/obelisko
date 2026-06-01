import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AppUser, User } from '../../../models/produto';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  user: AppUser | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.user$.subscribe((user: AppUser | null) => {
      this.user = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
